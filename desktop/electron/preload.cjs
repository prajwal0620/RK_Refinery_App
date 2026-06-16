const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rk", {
  openExternal: (url) => ipcRenderer.invoke("rk:openExternal", url),

  // Normal print dialog
  printReceiptHtml: (payload) => ipcRenderer.invoke("rk:printReceiptHtml", payload),

  // Thermal report print
  printThermalReport: (payload) => ipcRenderer.invoke("rk:printThermalReport", payload),
});