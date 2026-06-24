import { buildBillSlipHtml } from "./templates/billSlipHtml";

export async function printBillSmart(bill: any) {
  if (!window.rk) {
    alert("Run in Electron Desktop");
    return;
  }

  const paperWidth = (localStorage.getItem("rk_paper_width") || "72") as "72" | "80";
  let printerInterface = localStorage.getItem("rk_printer_interface") || "";

  // auto-detect if not set
  if (!printerInterface && window.rk.listPrinters) {
    const list = await window.rk.listPrinters();
    const def = list.find((p) => p.isDefault) || list[0];
    if (def) {
      printerInterface = `printer:${def.name}`;
      localStorage.setItem("rk_printer_interface", printerInterface);
      localStorage.setItem("rk_normal_printer_name", def.name);
    }
  }

  // 1) Thermal first
  if (window.rk.printThermalBill && printerInterface) {
    try {
      await window.rk.printThermalBill({ printerInterface, paperWidth, bill });
      return;
    } catch (e: any) {
      console.error("Thermal failed, fallback normal:", e?.message);
    }
  }

  // 2) Normal fallback
  if (!window.rk.printReceiptHtml) {
    alert("Normal print not available");
    return;
  }
  const html = buildBillSlipHtml(bill, paperWidth);
  const deviceName = localStorage.getItem("rk_normal_printer_name") || "";
  await window.rk.printReceiptHtml({ html, silent: false, deviceName: deviceName || undefined });
}