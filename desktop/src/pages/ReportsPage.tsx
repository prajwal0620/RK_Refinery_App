import { useState } from "react";
import { reportItems, reportSummary } from "../services/reportService";
import { exportItemWiseReportPdf } from "../utils/reportPdf";
import { buildItemWiseReportHtml } from "../utils/reportPrint";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const [summary, setSummary] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, it] = await Promise.all([reportSummary(from, to), reportItems(from, to)]);
      setSummary(s.data.data);
      setItems(it.data.data);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Report generate failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    exportItemWiseReportPdf({ from, to, summary, items });
  };

  const printNormal = async () => {
    if (!window.rk?.printReceiptHtml) return alert("Normal print available only in Electron.");
    const html = buildItemWiseReportHtml({ from, to, summary, items });
    await window.rk.printReceiptHtml({ html });
  };

  const printThermal = async () => {
    if (!window.rk?.printThermalReport) return alert("Thermal print available only in Electron.");
    const printerInterface = localStorage.getItem("rk_printer_interface") || "";
    const paperWidth = localStorage.getItem("rk_paper_width") || "80";
    if (!printerInterface) return alert("Set Printer Interface in Settings");

    try {
      await window.rk.printThermalReport({ printerInterface, paperWidth, from, to, summary, items });
      alert("Thermal printed");
    } catch (e: any) {
      alert(e?.message ?? "Thermal print failed");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports (Item-wise)</h1>

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
          <button type="button" onClick={load} className="w-full px-3 py-2 rounded bg-indigo-600 text-white">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={downloadPdf} className="w-full px-3 py-2 rounded bg-amber-600 text-white" disabled={!summary}>
            Download PDF
          </button>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={printNormal} className="w-full px-3 py-2 rounded bg-slate-900 text-white" disabled={!summary}>
            Print (Normal)
          </button>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={printThermal} className="w-full px-3 py-2 rounded bg-emerald-700 text-white" disabled={!summary}>
            Print (Thermal)
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow p-4">Total Bills: <b>{summary.totalBills}</b></div>
          <div className="bg-white rounded-xl shadow p-4">Total Weight: <b>{Number(summary.totalWeight).toFixed(2)} g</b></div>
          <div className="bg-white rounded-xl shadow p-4">Total Purity: <b>{Number(summary.totalPurity).toFixed(2)} g</b></div>
          <div className="bg-white rounded-xl shadow p-4">Total Majuri: <b>₹{Math.round(Number(summary.totalMajuri))}</b></div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Item/Description</th>
              <th className="p-2">Count</th>
              <th className="p-2">Total Weight</th>
              <th className="p-2">Total Purity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{r.description}</td>
                <td className="p-2 text-center">{r.itemCount}</td>
                <td className="p-2 text-right">{Number(r.totalWeight).toFixed(2)}</td>
                <td className="p-2 text-right">{Number(r.totalPurity).toFixed(2)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">No items in this range</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}