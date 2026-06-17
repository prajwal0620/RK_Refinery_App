const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");


let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

ipcMain.handle("rk:openExternal", async (_e, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("rk:listPrinters", async () => {
  if (!win) throw new Error("Window not ready");
  const printers = await win.webContents.getPrintersAsync();
  return printers.map((p) => ({ name: p.name, isDefault: p.isDefault }));
});

// Normal print dialog
ipcMain.handle("rk:printReceiptHtml", async (_e, payload) => {
  const { html, silent = false, deviceName } = payload;

  const printWin = new BrowserWindow({
    show: !silent,
    webPreferences: { sandbox: false },
  });

  await printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  await new Promise((resolve, reject) => {
    const opts = { silent: !!silent, printBackground: true };
    if (deviceName) opts.deviceName = deviceName;

    printWin.webContents.print(opts, (success, errorType) => {
      if (!success) reject(new Error(errorType || "Print failed"));
      else resolve(true);
    });
  });

  printWin.close();
  return true;
});

// HTML -> PDF
ipcMain.handle("rk:exportPdfFromHtml", async (_e, payload) => {
  const { html, defaultFileName = "document.pdf" } = payload;

  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: false },
  });

  await pdfWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  const pdfBuffer = await pdfWin.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
    marginsType: 1,
  });

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultFileName,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    pdfWin.close();
    return { saved: false };
  }

  fs.writeFileSync(filePath, pdfBuffer);
  pdfWin.close();
  return { saved: true, filePath };
});

// ----------------------------
// THERMAL HELPERS
// ----------------------------
function normalizeInterface(iface) {
  iface = String(iface || "").trim();
  if (!iface) return "";
  if (iface.includes("://")) return iface;
  if (!iface.toLowerCase().startsWith("printer:")) return `printer:${iface}`;
  return iface;
}

function padRight(str, n) {
  str = String(str ?? "");
  if (str.length >= n) return str.slice(0, n);
  return str + " ".repeat(n - str.length);
}

function padLeft(str, n) {
  str = String(str ?? "");
  if (str.length >= n) return str.slice(0, n);
  return " ".repeat(n - str.length) + str;
}

// Existing thermal report (optional)
ipcMain.handle("rk:printThermalReport", async (_e, payload) => {
  // keep your existing if needed
  return true;
});

// ✅ NEW: Item Detail Report thermal print
ipcMain.handle("rk:printThermalItemDetailsReport", async (_e, payload) => {
  let { printerInterface, paperWidth, from, to, data } = payload;

  printerInterface = normalizeInterface(printerInterface);
  if (!printerInterface) throw new Error("Printer interface missing. Set in Settings.");

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: printerInterface,
    options: { timeout: 8000 },
    width: paperWidth === "72" ? 42 : 48,
    characterSet: "SLOVENIA",
    removeSpecialCharacters: false,
    lineCharacter: "-",
  });

  const connected = await printer.isPrinterConnected();
  if (!connected) throw new Error("Thermal printer not connected.");

  const rows = data?.rows ?? [];

  printer.alignCenter();
  printer.println("|| श्री ||");
  printer.newLine();

  printer.bold(true);
  printer.println("RK REFINERY");
  printer.bold(false);
  printer.println("Mangal Katta Complex, 1st Floor");
  printer.println("Shop No 6 & 7, Shroff Bazar");
  printer.println("ADONI - 518301");
  printer.newLine();
  printer.println("Prop : Anil");
  printer.println("Mob : 9615889191 / 7033654242");
  printer.drawLine();

  printer.println("Item Detail Report");
  printer.drawLine();

  printer.alignLeft();
  printer.println(`From : ${from}`);
  printer.println(`To   : ${to}`);
  printer.drawLine();

  // Column header
  // Format: Date(10) Bill(9) Item(12) Wt(6) T(5) P(7)
  printer.println("Date       Bill No   Item         Wt   Tch   Pur");
  printer.drawLine();

  rows.forEach((r) => {
    const date = padRight(r.billDate || "", 10);
    const bill = padRight(r.billNo || "", 9);
    const item = padRight(r.description || "", 12);
    const wt = padLeft(Number(r.weight || 0).toFixed(2), 6);
    const tch = padLeft(Number(r.touch || 0).toFixed(0), 4);
    const pur = padLeft(Number(r.purity || 0).toFixed(2), 7);

    printer.println(`${date} ${bill} ${item} ${wt} ${tch} ${pur}`);
  });

  printer.drawLine();
  printer.println(`Total Bills  : ${Number(data?.totalBills ?? 0)}`);
  printer.println(`Total Items  : ${Number(data?.totalItems ?? 0)}`);
  printer.println(`Total Weight : ${Number(data?.totalWeight ?? 0).toFixed(2)} g`);
  printer.println(`Total Purity : ${Number(data?.totalPurity ?? 0).toFixed(2)} g`);
  printer.println(`Total Majuri : Rs.${Math.round(Number(data?.totalMajuri ?? 0))}`);
  printer.drawLine();

  printer.alignCenter();
  printer.println("Thank You Visit Again");
  printer.newLine();
  printer.cut();

  await printer.execute();
  return true;
});