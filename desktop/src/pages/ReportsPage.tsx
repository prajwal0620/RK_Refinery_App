import { useState } from "react";
import { reportItemDetails } from "../services/reportService";
import { buildItemDetailReportHtml } from "../utils/templates/reportHtml";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await reportItemDetails(from, to);
      setData(res.data.data);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Report generate failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!data) return alert("Generate report first");
    if (!window.rk?.exportPdfFromHtml) return alert("PDF export only in Electron");

    const html = buildItemDetailReportHtml({ from, to, data });
    await window.rk.exportPdfFromHtml({
      html,
      defaultFileName: `RK_ItemDetailReport_${from}_${to}.pdf`,
    });
  };

  const printNormal = async () => {
    if (!data) return alert("Generate report first");
    if (!window.rk?.printReceiptHtml) return alert("Normal print only in Electron");

    const html = buildItemDetailReportHtml({ from, to, data });
    const deviceName = localStorage.getItem("rk_normal_printer_name") || "";
    await window.rk.printReceiptHtml({ html, silent: !!deviceName, deviceName: deviceName || undefined });
  };
  const printThermal = async () => {
  if (!data) return alert("Generate report first");
  if (!window.rk) return alert("Run in Electron Desktop");

  const paperWidth = localStorage.getItem("rk_paper_width") || "80";

  // Auto pick printer (no settings required)
  let printerInterface = localStorage.getItem("rk_printer_interface") || "";
  let deviceName = localStorage.getItem("rk_normal_printer_name") || "";

  if ((!printerInterface || !deviceName) && window.rk.listPrinters) {
    const list = await window.rk.listPrinters();
    const def = list.find((p) => p.isDefault) || list[0];
    if (def) {
      printerInterface = printerInterface || `printer:${def.name}`;
      deviceName = deviceName || def.name;
      localStorage.setItem("rk_printer_interface", printerInterface);
      localStorage.setItem("rk_normal_printer_name", deviceName);
    }
  }

  // Try ESC/POS first
  if (window.rk.printThermalItemDetailsReport && printerInterface) {
    try {
      await window.rk.printThermalItemDetailsReport({ printerInterface, paperWidth, from, to, data });
      return alert("Thermal printed");
    } catch (e: any) {
      console.error("Thermal failed, fallback to windows:", e?.message);
      // fallback below
    }
  }

  // Fallback windows silent print
  if (!window.rk.printReceiptHtml) return alert("Normal print not available");

  const html = buildItemDetailReportHtml({ from, to, data });
  await window.rk.printReceiptHtml({
    html,
    silent: true,
    deviceName: deviceName || undefined,
  });

  // ✅ simple message
  alert("Printed");
};
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports (Item Detail)</h1>

      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-6 gap-3">
        <div>
          <label className="text-xs text-slate-500">From</label>
          <input className="w-full border rounded px-2 py-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">To</label>
          <input className="w-full border rounded px-2 py-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="button" onClick={generate} className="w-full px-3 py-2 rounded bg-indigo-600 text-white">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={downloadPdf} className="w-full px-3 py-2 rounded bg-amber-600 text-white" disabled={!data}>
            Download PDF
          </button>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={printNormal} className="w-full px-3 py-2 rounded bg-slate-900 text-white" disabled={!data}>
            Print (Normal)
          </button>
        </div>
        <div className="flex items-end">
        <button type="button" onClick={printThermal} className="w-full px-3 py-2 rounded bg-emerald-700 text-white" disabled={!data}>
  Print (Thermal)
</button>
</div>
        
      </div>

      {data && (
        <>
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white rounded-xl shadow p-4">Total Bills: <b>{data.totalBills}</b></div>
            <div className="bg-white rounded-xl shadow p-4">Total Items: <b>{data.totalItems}</b></div>
            <div className="bg-white rounded-xl shadow p-4">Total Weight: <b>{Number(data.totalWeight).toFixed(2)} g</b></div>
            <div className="bg-white rounded-xl shadow p-4">Total Purity: <b>{Number(data.totalPurity).toFixed(2)} g</b></div>
            <div className="bg-white rounded-xl shadow p-4">Total Majuri: <b>₹{Math.round(Number(data.totalMajuri))}</b></div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Bill No</th>
                  <th className="p-2 text-left">Item/Description</th>
                  <th className="p-2 text-right">Weight</th>
                  <th className="p-2 text-right">Touch</th>
                  <th className="p-2 text-right">Purity</th>
                </tr>
              </thead>
              <tbody>
                {data.rows?.map((r: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{r.billDate}</td>
                    <td className="p-2">{r.billNo}</td>
                    <td className="p-2">{r.description}</td>
                    <td className="p-2 text-right">{Number(r.weight).toFixed(2)}</td>
                    <td className="p-2 text-right">{Number(r.touch).toFixed(2)}</td>
                    <td className="p-2 text-right">{Number(r.purity).toFixed(2)}</td>
                  </tr>
                ))}
                {(!data.rows || data.rows.length === 0) && (
                  <tr><td className="p-4 text-center text-slate-500" colSpan={6}>No data</td></tr>
                )}
              </tbody>
            </table>

            {/* ✅ Summary at bottom */}
            <div className="border-t p-3 text-sm bg-slate-50">
              <b>Summary:</b> Total Weight {Number(data.totalWeight).toFixed(2)} g | Total Purity {Number(data.totalPurity).toFixed(2)} g | Total Majuri ₹{Math.round(Number(data.totalMajuri))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}