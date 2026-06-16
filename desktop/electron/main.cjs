const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
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

// Normal print dialog (works without thermal printer)
ipcMain.handle("rk:printReceiptHtml", async (_e, payload) => {
  const { html } = payload;

  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: false },
  });

  await printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  await new Promise((resolve, reject) => {
    printWin.webContents.print({ silent: false, printBackground: true }, (success, errorType) => {
      if (!success) reject(new Error(errorType || "Print failed"));
      else resolve(true);
    });
  });

  printWin.close();
  return true;
});

// Thermal print: Item-wise report
ipcMain.handle("rk:printThermalReport", async (_e, payload) => {
  const { printerInterface, paperWidth, from, to, summary, items } = payload;

  if (!printerInterface) throw new Error("Printer interface missing. Set in Settings.");

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: printerInterface,
    options: { timeout: 5000 },
    width: paperWidth === "72" ? 42 : 48,
    characterSet: "SLOVENIA",
    removeSpecialCharacters: false,
    lineCharacter: "-",
  });

  const connected = await printer.isPrinterConnected();
  if (!connected) throw new Error("Thermal printer not connected.");

  const totalBills = Number(summary?.totalBills ?? 0);
  const totalWeight = Number(summary?.totalWeight ?? 0);
  const totalPurity = Number(summary?.totalPurity ?? 0);
  const totalMajuri = Number(summary?.totalMajuri ?? 0);

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

  printer.println("Item-wise Report");
  printer.drawLine();

  printer.alignLeft();
  printer.println(`From : ${from}`);
  printer.println(`To   : ${to}`);
  printer.drawLine();

  printer.println(`Total Bills  : ${totalBills}`);
  printer.println(`Total Weight : ${totalWeight.toFixed(2)} g`);
  printer.println(`Total Purity : ${totalPurity.toFixed(2)} g`);
  printer.println(`Total Majuri : ₹${Math.round(totalMajuri)}`);
  printer.drawLine();

  printer.println("Item            Cnt   Wt    Pur");
  printer.drawLine();

  items.forEach((r) => {
    const desc = String(r.description ?? "").slice(0, 12).padEnd(12, " ");
    const cnt = String(r.itemCount ?? 0).padStart(3, " ");
    const wt = Number(r.totalWeight ?? 0).toFixed(2).padStart(7, " ");
    const pur = Number(r.totalPurity ?? 0).toFixed(2).padStart(7, " ");
    printer.println(`${desc} ${cnt} ${wt} ${pur}`);
  });

  printer.drawLine();
  printer.alignCenter();
  printer.println("Thank You Visit Again");
  printer.newLine();
  printer.cut();

  await printer.execute();
  return true;
});