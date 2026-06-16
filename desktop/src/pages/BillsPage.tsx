import { useEffect, useState } from "react";
import { deleteBill, duplicateBill, getBill, searchBills } from "../services/billService";
import { useNavigate } from "react-router-dom";
import { exportBillPdf } from "../utils/pdf";
import { buildWhatsAppUrl } from "../utils/whatsapp";

export default function BillsPage() {
  const nav = useNavigate();

  // IMPORTANT: default empty => show all
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [billNo, setBillNo] = useState("");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await searchBills({
        from: from || undefined,
        to: to || undefined,
        mobile: mobile || undefined,
        name: name || undefined,
        billNo: billNo || undefined,
      });
      setRows(res.data.data);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const clear = async () => {
    setFrom(""); setTo(""); setMobile(""); setName(""); setBillNo("");
    setTimeout(load, 0);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this bill?")) return;
    await deleteBill(id);
    await load();
  };

  const onDuplicate = async (id: number) => {
    await duplicateBill(id);
    alert("Duplicated. Refreshing list...");
    await load();
  };

  const buildReceiptHtml = (bill: any) => {
    const lines = [
      "|| श्री ||",
      "",
      "RK REFINERY",
      "Silver Exchange",
      "",
      `Bill No   : ${bill.billNo}`,
      `Date      : ${bill.billDate}`,
      `Customer  : ${bill.customerName}`,
      `Mobile    : ${bill.customerMobile}`,
      "--------------------------------",
      "# Item   Wt(g)  Tch   Pur(g)",
      "--------------------------------",
      ...bill.items.map((it: any, idx: number) =>
        `${idx + 1}  ${it.description}  ${Number(it.weight).toFixed(2)}  ${Number(it.touch).toFixed(2)}  ${Number(it.purity).toFixed(2)}`
      ),
      "--------------------------------",
      `Total Weight : ${Number(bill.totalWeight).toFixed(2)} g`,
      `Total Purity : ${Number(bill.totalPurity).toFixed(2)} g`,
      `Majuri       : ₹${Number(bill.majuri).toFixed(0)}`,
      "--------------------------------",
      "Thank You Visit Again",
    ];

    return `
    <html><head><meta charset="utf-8" />
    <style>body{font-family:monospace;padding:10px}pre{font-size:12px;white-space:pre-wrap}</style>
    </head><body><pre>${lines.join("\n")}</pre></body></html>`;
  };

  const onPrint = async (id: number) => {
    const res = await getBill(id);
    const bill = res.data.data;
    if (!window.rk?.printReceiptHtml) return alert("Printing not available. Run via Electron.");
    await window.rk.printReceiptHtml({ html: buildReceiptHtml(bill) });
  };

  const onWhatsApp = async (id: number) => {
    const res = await getBill(id);
    const bill = res.data.data;
    const msg = [
      `Bill No: ${bill.billNo}`,
      `Date: ${bill.billDate}`,
      `Customer: ${bill.customerName}`,
      "",
      ...bill.items.map((it: any, i: number) =>
        `${i + 1}. ${it.description} | Wt:${Number(it.weight).toFixed(2)} | Tch:${Number(it.touch).toFixed(2)} | Pur:${Number(it.purity).toFixed(2)}`
      ),
      "",
      `Total Weight: ${Number(bill.totalWeight).toFixed(2)} g`,
      `Total Purity: ${Number(bill.totalPurity).toFixed(2)} g`,
      `Majuri: ₹${Number(bill.majuri).toFixed(0)}`
    ].join("\n");

    const url = buildWhatsAppUrl(bill.customerMobile, msg);
    if (window.rk?.openExternal) await window.rk.openExternal(url);
    else window.open(url, "_blank");
  };

  const onPdf = async (id: number) => {
    const res = await getBill(id);
    exportBillPdf(res.data.data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">View All Bills</h1>
        <button onClick={() => nav("/billing")} className="px-3 py-2 rounded bg-slate-900 text-white">
          New Billing
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-6 gap-3">
        <div>
          <label className="text-xs text-slate-500">From</label>
          <input className="w-full border rounded px-2 py-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">To</label>
          <input className="w-full border rounded px-2 py-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Mobile</label>
          <input className="w-full border rounded px-2 py-1" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Customer</label>
          <input className="w-full border rounded px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bill No</label>
          <input className="w-full border rounded px-2 py-1" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={load} className="w-full px-3 py-2 rounded bg-indigo-600 text-white">
            {loading ? "Loading..." : "Search"}
          </button>
          <button onClick={clear} className="w-full px-3 py-2 rounded bg-slate-200">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Bill No</th>
              <th className="p-2">Date</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Weight</th>
              <th className="p-2">Purity</th>
              <th className="p-2">Majuri</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-medium">{r.billNo}</td>
                <td className="p-2">{r.billDate}</td>
                <td className="p-2">{r.customerName}</td>
                <td className="p-2">{r.customerMobile}</td>
                <td className="p-2 text-right">{Number(r.totalWeight).toFixed(2)}</td>
                <td className="p-2 text-right">{Number(r.totalPurity).toFixed(2)}</td>
                <td className="p-2 text-right">₹{Number(r.majuri).toFixed(0)}</td>
                <td className="p-2 flex gap-2 justify-center flex-wrap">
                  <button className="px-2 py-1 rounded bg-slate-200" onClick={() => onPrint(r.id)}>Print</button>
                  <button className="px-2 py-1 rounded bg-green-600 text-white" onClick={() => onWhatsApp(r.id)}>WhatsApp</button>
                  <button className="px-2 py-1 rounded bg-amber-600 text-white" onClick={() => onPdf(r.id)}>PDF</button>
                  <button className="px-2 py-1 rounded bg-slate-200" onClick={() => onDuplicate(r.id)}>Duplicate</button>
                  <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => onDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr><td className="p-4 text-center text-slate-500" colSpan={8}>No bills found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}