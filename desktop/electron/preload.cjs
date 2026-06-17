const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rk", {
  openExternal: (url) => ipcRenderer.invoke("rk:openExternal", url),

  listPrinters: () => ipcRenderer.invoke("rk:listPrinters"),

  // Normal print dialog
  printReceiptHtml: (payload) => ipcRenderer.invoke("rk:printReceiptHtml", payload),

  // PDF export (HTML -> PDF)
  exportPdfFromHtml: (payload) => ipcRenderer.invoke("rk:exportPdfFromHtml", payload),

  // ✅ Thermal Bill Print (NEW)
  printThermalBill: (payload) => ipcRenderer.invoke("rk:printThermalBill", payload),

  // Thermal reports (if you already use)
  printThermalReport: (payload) => ipcRenderer.invoke("rk:printThermalReport", payload),
  printThermalItemDetailsReport: (payload) => ipcRenderer.invoke("rk:printThermalItemDetailsReport", payload),
});