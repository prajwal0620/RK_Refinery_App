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
app.on("window-all-closed", () => app.quit());

// ---------- helpers ----------
function normalizeInterface(iface) {
  iface = String(iface || "").trim();
  if (!iface) return "";
  if (iface.includes("://")) return iface;
  if (iface.toLowerCase().startsWith("printer:")) return iface;
  return `printer:${iface}`;
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

function makeThermal(printerInterface, paperWidth) {
  const W = paperWidth === "72" ? 42 : 48;
  return new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: normalizeInterface(printerInterface),
    options: { timeout: 8000 },
    width: W,
    characterSet: "SLOVENIA",
    removeSpecialCharacters: false,
    lineCharacter: "-",
  });
}

// ---------- IPC ----------
ipcMain.handle("rk:openExternal", async (_e, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("rk:listPrinters", async () => {
  if (!win) throw new Error("Window not ready");
  const printers = await win.webContents.getPrintersAsync();
  return printers.map((p) => ({ name: p.name, isDefault: p.isDefault }));
});

// Normal Windows print (dialog OR silent)
ipcMain.handle("rk:printReceiptHtml", async (_e, payload) => {
  const { html, silent = false, deviceName } = payload;

  const printWin = new BrowserWindow({
    show: true, // show the receipt window (acts like preview)
    webPreferences: { sandbox: false },
  });

  await printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  await new Promise((resolve, reject) => {
    const opts = { silent: !!silent, printBackground: true };
    if (deviceName) opts.deviceName = deviceName;

    // Open Windows print dialog if silent=false
    printWin.webContents.print(opts, (success, errorType) => {
      if (!success) reject(new Error(errorType || "Print failed"));
      else resolve(true);
    });
  });

  // keep window a bit then close (so user sees it)
  setTimeout(() => {
    try { printWin.close(); } catch (_) {}
  }, 800);

  return true;
});

// Optional: HTML -> PDF
ipcMain.handle("rk:exportPdfFromHtml", async (_e, payload) => {
  const { html, defaultFileName = "document.pdf" } = payload;

  const pdfWin = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
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

// ✅ Thermal BILL print (72mm slip style + || श्री ||)
ipcMain.handle("rk:printThermalBill", async (_e, payload) => {
  let { printerInterface, paperWidth, bill } = payload;

  printerInterface = normalizeInterface(printerInterface);
  if (!printerInterface) throw new Error("Printer interface missing.");

  const printer = makeThermal(printerInterface, paperWidth);
  const connected = await printer.isPrinterConnected();
  if (!connected) throw new Error("Thermal printer not connected.");

  // 72mm compact columns like photo
  const col = paperWidth === "72"
    ? { sr: 2, item: 8, wt: 9, tch: 6, pur: 9 }
    : { sr: 2, item: 12, wt: 10, tch: 7, pur: 10 };

  const rowLine = (sr, item, wt, tch, pur) =>
    `${padLeft(sr, col.sr)} ${padRight(item, col.item)} ${padLeft(wt, col.wt)} ${padLeft(tch, col.tch)} ${padLeft(pur, col.pur)}`;

  // Header exactly like image-2
  printer.alignCenter();
  printer.println("|| श्री ||");
  printer.bold(true);
  printer.println("R.K.REFINERY Silver Exchange");
  printer.bold(false);
  printer.println("Mangal Katta Complex, 1st Floor, Shop No 6 &");
  printer.println("7, Shroff Bazar, ADONI");
  printer.println("518301, Kurnool dist");
  printer.println("Prop: Anil | Mob: 9615889191, 7033654242");
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Bill No: ${bill.billNo}`);
  printer.println(`Date: ${bill.billDate}`);
  printer.println(`Name: ${bill.customerName}`);
  printer.println(`Mobile: ${bill.customerMobile}`);
  printer.drawLine();

  printer.println(rowLine("#", "Item", "Wt", "Tch", "Pur"));
  printer.drawLine();

  (bill.items || []).forEach((it, idx) => {
    printer.println(
      rowLine(
        idx + 1,
        it.description,
        Number(it.weight || 0).toFixed(2),
        Number(it.touch || 0).toFixed(2),
        Number(it.purity || 0).toFixed(2)
      )
    );
  });

  printer.drawLine();
  printer.println(`Total Weight: ${Number(bill.totalWeight || 0).toFixed(2)} g`);
  printer.println(`Total Purity: ${Number(bill.totalPurity || 0).toFixed(2)} g`);
  printer.println(`Total Majuri: Rs.${Math.round(Number(bill.majuri || 0))}`);
  // If you want Majuri line like your app:
  // printer.println(`Total Majuri: Rs.${Math.round(Number(bill.majuri || 0))}`);

  printer.newLine();
  printer.alignCenter();
  printer.println("Thank You Visit Again");
  printer.newLine();
  printer.cut();

  await printer.execute();
  return true;
});