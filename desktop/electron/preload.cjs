const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rk", {
  openExternal: (url) => ipcRenderer.invoke("rk:openExternal", url),
  listPrinters: () => ipcRenderer.invoke("rk:listPrinters"),

  // Normal print (Windows driver)
  printReceiptHtml: (payload) => ipcRenderer.invoke("rk:printReceiptHtml", payload),

  // Thermal bill print
  printThermalBill: (payload) => ipcRenderer.invoke("rk:printThermalBill", payload),

  // PDF export (optional)
  exportPdfFromHtml: (payload) => ipcRenderer.invoke("rk:exportPdfFromHtml", payload),
});