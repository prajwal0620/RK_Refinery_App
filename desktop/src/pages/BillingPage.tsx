// import { useMemo, useRef, useState } from "react";
// import { createBill } from "../services/billService";
// import { buildWhatsAppUrl } from "../utils/whatsapp";
// import { exportBillPdf } from "../utils/pdf";
// import { useNavigate } from "react-router-dom";

// type Row = {
//   description: string;
//   weight: string;
//   touch: string;
//   purity: number;
// };

// const emptyRow = (): Row => ({ description: "", weight: "", touch: "", purity: 0 });
// const cols = ["description", "weight", "touch"] as const;

// export default function BillingPage() {
//   const nav = useNavigate();

//   const [customerName, setCustomerName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [date] = useState(() => new Date().toISOString().slice(0, 10));
//   const [rate, setRate] = useState("0");

//   const [rows, setRows] = useState<Row[]>([emptyRow()]);
//   const [saving, setSaving] = useState(false);
//   const [lastSavedBill, setLastSavedBill] = useState<any>(null);

//   const cellRefs = useRef<Array<Array<HTMLInputElement | null>>>([]);

//   const computedRows = useMemo(() => {
//     return rows.map((r) => {
//       const w = Number(r.weight || 0);
//       const t = Number(r.touch || 0);
//       const purity = Number(((w * t) / 100).toFixed(2));
//       return { ...r, purity };
//     });
//   }, [rows]);

//   const totals = useMemo(() => {
//     const totalWeight = computedRows.reduce((a, r) => a + Number(r.weight || 0), 0);
//     const totalPurity = computedRows.reduce((a, r) => a + (r.purity || 0), 0);
//     const majuri = totalWeight * Number(rate || 0);
//     return {
//       totalWeight: Number(totalWeight.toFixed(2)),
//       totalPurity: Number(totalPurity.toFixed(2)),
//       majuri: Number(majuri.toFixed(2)),
//       rate: Number(rate || 0),
//     };
//   }, [computedRows, rate]);

//   const setCellRef = (r: number, c: number, el: HTMLInputElement | null) => {
//     if (!cellRefs.current[r]) cellRefs.current[r] = [];
//     cellRefs.current[r][c] = el;
//   };

//   const focusCell = (r: number, c: number) => {
//     const el = cellRefs.current?.[r]?.[c];
//     el?.focus();
//     el?.select?.();
//   };

//   const ensureRow = (idx: number) => {
//     if (idx === rows.length - 1) setRows((p) => [...p, emptyRow()]);
//   };

//   const onKeyDown = (e: React.KeyboardEvent, rIndex: number, cIndex: number) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       if (cIndex < cols.length - 1) focusCell(rIndex, cIndex + 1);
//       else {
//         ensureRow(rIndex);
//         focusCell(rIndex + 1, 0);
//       }
//     }
//   };

//   const updateRow = (idx: number, patch: Partial<Row>) => {
//     setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
//   };

//   const save = async () => {
//     const items = computedRows
//       .filter((r) => r.description.trim() && Number(r.weight) > 0)
//       .map((r) => ({
//         description: r.description.trim(),
//         weight: Number(r.weight),
//         touch: Number(r.touch || 0),
//       }));

//     if (!customerName.trim()) return alert("Enter customer name");
//     if (!/^\d{10}$/.test(mobile)) return alert("Enter valid 10-digit mobile");
//     if (items.length === 0) return alert("Add at least one item");

//     setSaving(true);
//     try {
//       const res = await createBill({
//         customerName,
//         customerMobile: mobile,
//         date,
//         rate: Number(rate || 0),
//         items,
//       });

//       setLastSavedBill(res.data.data);
//       alert(`Bill saved: ${res.data.data.billNo}`);
//     } catch (e: any) {
//       alert(e?.response?.data?.message ?? "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const buildReceiptHtml = (bill: any) => {
//     const lines = [
//       "|| श्री ||",
//       "",
//       "RK REFINERY",
//       "Mangal Katta Complex, 1st Floor",
//       "Shop No 6 & 7, Shroff Bazar",
//       "ADONI - 518301",
//       "",
//       "Prop : Anil",
//       "Mob : 9615889191 / 7033654242",
//       "--------------------------------",
//       "Silver Exchange",
//       "--------------------------------",
//       `Bill No   : ${bill.billNo}`,
//       `Date      : ${bill.billDate}`,
//       `Customer  : ${bill.customerName}`,
//       `Mobile    : ${bill.customerMobile}`,
//       "--------------------------------",
//       "# Item   Wt(g)  Tch   Pur(g)",
//       "--------------------------------",
//       ...bill.items.map((it: any, idx: number) =>
//         `${idx + 1}  ${it.description}  ${Number(it.weight).toFixed(2)}  ${Number(it.touch).toFixed(2)}  ${Number(it.purity).toFixed(2)}`
//       ),
//       "--------------------------------",
//       `Total Weight : ${Number(bill.totalWeight).toFixed(2)} g`,
//       `Majuri Rate  : ${Number(totals.rate).toFixed(2)}`,
//       `Total Purity : ${Number(bill.totalPurity).toFixed(2)} g`,
//       `Majuri       : ₹${Number(bill.majuri).toFixed(0)}`,
//       "--------------------------------",
//       "Thank You Visit Again",
//     ];

//     return `
//     <html>
//       <head>
//         <meta charset="utf-8" />
//         <style>
//           body { font-family: monospace; padding: 10px; }
//           pre { font-size: 12px; line-height: 1.25; white-space: pre-wrap; }
//         </style>
//       </head>
//       <body><pre>${lines.join("\n")}</pre></body>
//     </html>`;
//   };

//   const printBill = async () => {
//     if (!lastSavedBill) return alert("Please Save Bill first");
//     if (!window.rk?.printReceiptHtml) {
//       return alert("Printing not available. Please run via Electron and update electron/main.cjs + preload.cjs.");
//     }
//     try {
//       const html = buildReceiptHtml(lastSavedBill);
//       await window.rk.printReceiptHtml({ html }); // Works without thermal printer
//     } catch (e: any) {
//       alert(e?.message ?? "Print failed");
//     }
//   };

//   const sendWhatsApp = async () => {
//     const bill = lastSavedBill || {
//       billNo: "TEMP",
//       billDate: date,
//       customerName,
//       customerMobile: mobile,
//       totalWeight: totals.totalWeight,
//       totalPurity: totals.totalPurity,
//       majuri: totals.majuri,
//       items: computedRows
//         .filter((r) => r.description.trim() && Number(r.weight) > 0)
//         .map((r) => ({ description: r.description, weight: Number(r.weight), touch: Number(r.touch), purity: r.purity })),
//     };

//     const msg = [
//       "|| श्री ||",
//       "RK REFINERY",
//       "Silver Exchange",
//       "",
//       `Bill No: ${bill.billNo}`,
//       `Date: ${bill.billDate}`,
//       `Customer: ${bill.customerName}`,
//       `Mobile: ${bill.customerMobile}`,
//       "",
//       ...bill.items.map((it: any, i: number) =>
//         `${i + 1}. ${it.description} | Wt:${Number(it.weight).toFixed(2)} | Tch:${Number(it.touch).toFixed(2)} | Pur:${Number(it.purity).toFixed(2)}`
//       ),
//       "",
//       `Total Weight: ${Number(bill.totalWeight).toFixed(2)} g`,
//       `Total Purity: ${Number(bill.totalPurity).toFixed(2)} g`,
//       `Majuri: ₹${Number(bill.majuri).toFixed(0)}`,
//       "",
//       "Thank You Visit Again",
//     ].join("\n");

//     const url = buildWhatsAppUrl(bill.customerMobile, msg);
//     if (window.rk?.openExternal) await window.rk.openExternal(url);
//     else window.open(url, "_blank");
//   };

//   const pdf = () => {
//     const bill = lastSavedBill || {
//       billNo: "TEMP",
//       billDate: date,
//       customerName,
//       customerMobile: mobile,
//       totalWeight: totals.totalWeight,
//       totalPurity: totals.totalPurity,
//       majuri: totals.majuri,
//       items: computedRows
//         .filter((r) => r.description.trim() && Number(r.weight) > 0)
//         .map((r) => ({ description: r.description, weight: Number(r.weight), touch: Number(r.touch), purity: r.purity })),
//     };
//     exportBillPdf(bill);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Billing</h1>
//         <div className="flex gap-2">
//           <button onClick={() => nav("/bills")} className="px-3 py-2 rounded bg-slate-200">View All Bills</button>
//           <button disabled={saving} onClick={save} className="px-3 py-2 rounded bg-slate-900 text-white">
//             {saving ? "Saving..." : "Save Bill"}
//           </button>
//           <button onClick={printBill} className="px-3 py-2 rounded bg-indigo-600 text-white">Print Bill</button>
//           <button onClick={sendWhatsApp} className="px-3 py-2 rounded bg-green-600 text-white">Send WhatsApp</button>
//           <button onClick={pdf} className="px-3 py-2 rounded bg-amber-600 text-white">Generate PDF</button>
//         </div>
//       </div>

//       <div className="grid grid-cols-4 gap-3 bg-white rounded-xl shadow p-4">
//         <div>
//           <label className="text-sm font-medium">Customer Name</label>
//           <input className="mt-1 w-full border rounded px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Mobile Number</label>
//           <input className="mt-1 w-full border rounded px-3 py-2" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Date</label>
//           <input className="mt-1 w-full border rounded px-3 py-2" value={date} readOnly />
//         </div>
//         <div>
//           <label className="text-sm font-medium">Majuri Rate</label>
//           <input className="mt-1 w-full border rounded px-3 py-2" value={rate} onChange={(e) => setRate(e.target.value)} />
//         </div>

//         {lastSavedBill && (
//           <div className="col-span-4 text-sm p-2 bg-green-50 rounded">
//             Saved: <b>{lastSavedBill.billNo}</b>
//           </div>
//         )}
//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-xl shadow overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-100">
//             <tr>
//               <th className="p-2 w-16">SR.NO</th>
//               <th className="p-2 text-left">Item/Description</th>
//               <th className="p-2 w-40">Weight (g)</th>
//               <th className="p-2 w-40">Touch (%)</th>
//               <th className="p-2 w-40">Purity</th>
//             </tr>
//           </thead>
//           <tbody>
//             {computedRows.map((r, i) => (
//               <tr key={i} className="border-t">
//                 <td className="p-2 text-center">{i + 1}</td>

//                 <td className="p-2">
//                   <input
//                     ref={(el) => setCellRef(i, 0, el)}
//                     className="w-full border rounded px-2 py-1"
//                     value={rows[i]?.description ?? ""}
//                     onChange={(e) => updateRow(i, { description: e.target.value })}
//                     onKeyDown={(e) => onKeyDown(e, i, 0)}
//                     placeholder="e.g. 454 / Chain"
//                   />
//                 </td>

//                 <td className="p-2">
//                   <input
//                     ref={(el) => setCellRef(i, 1, el)}
//                     className="w-full border rounded px-2 py-1 text-right"
//                     value={rows[i]?.weight ?? ""}
//                     onChange={(e) => updateRow(i, { weight: e.target.value })}
//                     onKeyDown={(e) => onKeyDown(e, i, 1)}
//                     placeholder="0.00"
//                   />
//                 </td>

//                 <td className="p-2">
//                   <input
//                     ref={(el) => setCellRef(i, 2, el)}
//                     className="w-full border rounded px-2 py-1 text-right"
//                     value={rows[i]?.touch ?? ""}
//                     onChange={(e) => updateRow(i, { touch: e.target.value })}
//                     onKeyDown={(e) => onKeyDown(e, i, 2)}
//                     placeholder="0.00"
//                   />
//                 </td>

//                 <td className="p-2 text-right pr-4">{r.purity.toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* SUMMARY UNDER TABLE (as you asked) */}
//         <div className="border-t p-3 grid grid-cols-4 gap-3 text-sm bg-slate-50">
//           <div className="p-2 bg-white rounded">
//             Total Weight: <b>{totals.totalWeight.toFixed(2)} g</b>
//           </div>
//           <div className="p-2 bg-white rounded">
//             Majuri: <b>₹{totals.majuri.toFixed(0)}</b>
//           </div>
//           <div className="p-2 bg-white rounded">
//             Total Purity: <b>{totals.totalPurity.toFixed(2)} g</b>
//           </div>
//           <div className="p-2 bg-white rounded">
//             Majuri Rate: <b>{totals.rate.toFixed(2)}</b>
//           </div>
//         </div>

//         <div className="p-3 text-xs text-slate-500">
//           ENTER: next column → last column → next row (auto new row).
//         </div>
//       </div>
//     </div>
//   );
// }
import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createBill } from "../services/billService";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { exportBillPdf } from "../utils/pdf";
import { useNavigate } from "react-router-dom";

type Row = {
  description: string;
  weight: string;
  touch: string;
  purity: number;
};

const emptyRow = (): Row => ({ description: "", weight: "", touch: "", purity: 0 });
const cols = ["description", "weight", "touch"] as const;

export default function BillingPage() {
  const nav = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");

  // ✅ Date editable now
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // ✅ Majuri rate state remains, but input moved to bottom summary
  const [rate, setRate] = useState("0");

  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [lastSavedBill, setLastSavedBill] = useState<any>(null);

  const cellRefs = useRef<Array<Array<HTMLInputElement | null>>>([]);

  const computedRows = useMemo(() => {
    return rows.map((r) => {
      const w = Number(r.weight || 0);
      const t = Number(r.touch || 0);
      const purity = Number(((w * t) / 100).toFixed(2));
      return { ...r, purity };
    });
  }, [rows]);

  const totals = useMemo(() => {
    const totalWeight = computedRows.reduce((a, r) => a + Number(r.weight || 0), 0);
    const totalPurity = computedRows.reduce((a, r) => a + (r.purity || 0), 0);
    const majuri = totalWeight * Number(rate || 0);

    return {
      totalWeight: Number(totalWeight.toFixed(2)),
      totalPurity: Number(totalPurity.toFixed(2)),
      majuri: Number(majuri.toFixed(2)),
      rate: Number(rate || 0),
    };
  }, [computedRows, rate]);

  const setCellRef = (r: number, c: number, el: HTMLInputElement | null) => {
    if (!cellRefs.current[r]) cellRefs.current[r] = [];
    cellRefs.current[r][c] = el;
  };

  const focusCell = (r: number, c: number) => {
    const el = cellRefs.current?.[r]?.[c];
    el?.focus();
    el?.select?.();
  };

  const ensureRow = (idx: number) => {
    if (idx === rows.length - 1) setRows((p) => [...p, emptyRow()]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, rIndex: number, cIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (cIndex < cols.length - 1) focusCell(rIndex, cIndex + 1);
      else {
        ensureRow(rIndex);
        // note: focus will happen after render; keeping same behavior as your code
        focusCell(rIndex + 1, 0);
      }
    }
  };

  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    const items = computedRows
      .filter((r) => r.description.trim() && Number(r.weight) > 0)
      .map((r) => ({
        description: r.description.trim(),
        weight: Number(r.weight),
        touch: Number(r.touch || 0),
      }));

    if (!customerName.trim()) return alert("Enter customer name");
    if (!/^\d{10}$/.test(mobile)) return alert("Enter valid 10-digit mobile");
    if (items.length === 0) return alert("Add at least one item");

    setSaving(true);
    try {
      const res = await createBill({
        customerName,
        customerMobile: mobile,
        date,
        rate: Number(rate || 0),
        items,
      });

      setLastSavedBill(res.data.data);
      alert(`Bill saved: ${res.data.data.billNo}`);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const buildReceiptHtml = (bill: any) => {
    const lines = [
      "|| श्री ||",
      "",
      "RK REFINERY",
      "Mangal Katta Complex, 1st Floor",
      "Shop No 6 & 7, Shroff Bazar",
      "ADONI - 518301",
      "",
      "Prop : Anil",
      "Mob : 9615889191 / 7033654242",
      "--------------------------------",
      "Silver Exchange",
      "--------------------------------",
      `Bill No   : ${bill.billNo}`,
      `Date      : ${bill.billDate}`,
      `Customer  : ${bill.customerName}`,
      `Mobile    : ${bill.customerMobile}`,
      "--------------------------------",
      "# Item   Wt(g)  Tch   Pur(g)",
      "--------------------------------",
      ...bill.items.map(
        (it: any, idx: number) =>
          `${idx + 1}  ${it.description}  ${Number(it.weight).toFixed(2)}  ${Number(it.touch).toFixed(
            2
          )}  ${Number(it.purity).toFixed(2)}`
      ),
      "--------------------------------",
      `Total Weight : ${Number(bill.totalWeight).toFixed(2)} g`,
      `Majuri Rate  : ${Number(bill.rate ?? totals.rate).toFixed(2)}`,
      `Total Purity : ${Number(bill.totalPurity).toFixed(2)} g`,
      `Majuri       : ₹${Number(bill.majuri).toFixed(0)}`,
      "--------------------------------",
      "Thank You Visit Again",
    ];

    return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: monospace; padding: 10px; }
          pre { font-size: 12px; line-height: 1.25; white-space: pre-wrap; }
        </style>
      </head>
      <body><pre>${lines.join("\n")}</pre></body>
    </html>`;
  };

  const printBill = async () => {
    if (!lastSavedBill) return alert("Please Save Bill first");
    if (!window.rk?.printReceiptHtml) {
      return alert("Printing not available. Please run via Electron and update electron/main.cjs + preload.cjs.");
    }
    try {
      const html = buildReceiptHtml(lastSavedBill);
      await window.rk.printReceiptHtml({ html });
    } catch (e: any) {
      alert(e?.message ?? "Print failed");
    }
  };

  const sendWhatsApp = async () => {
    const bill = lastSavedBill || {
      billNo: "TEMP",
      billDate: date,
      customerName,
      customerMobile: mobile,
      rate: totals.rate,
      totalWeight: totals.totalWeight,
      totalPurity: totals.totalPurity,
      majuri: totals.majuri,
      items: computedRows
        .filter((r) => r.description.trim() && Number(r.weight) > 0)
        .map((r) => ({
          description: r.description,
          weight: Number(r.weight),
          touch: Number(r.touch),
          purity: r.purity,
        })),
    };

    const msg = [
      "|| श्री ||",
      "RK REFINERY",
      "Silver Exchange",
      "",
      `Bill No: ${bill.billNo}`,
      `Date: ${bill.billDate}`,
      `Customer: ${bill.customerName}`,
      `Mobile: ${bill.customerMobile}`,
      "",
      ...bill.items.map(
        (it: any, i: number) =>
          `${i + 1}. ${it.description} | Wt:${Number(it.weight).toFixed(2)} | Tch:${Number(it.touch).toFixed(
            2
          )} | Pur:${Number(it.purity).toFixed(2)}`
      ),
      "",
      `Total Weight: ${Number(bill.totalWeight).toFixed(2)} g`,
      `Total Purity: ${Number(bill.totalPurity).toFixed(2)} g`,
      `Majuri Rate: ${Number(bill.rate ?? totals.rate).toFixed(2)}`,
      `Majuri: ₹${Number(bill.majuri).toFixed(0)}`,
      "",
      "Thank You Visit Again",
    ].join("\n");

    const url = buildWhatsAppUrl(bill.customerMobile, msg);
    if (window.rk?.openExternal) await window.rk.openExternal(url);
    else window.open(url, "_blank");
  };

  const pdf = () => {
    const bill = lastSavedBill || {
      billNo: "TEMP",
      billDate: date,
      customerName,
      customerMobile: mobile,
      rate: totals.rate,
      totalWeight: totals.totalWeight,
      totalPurity: totals.totalPurity,
      majuri: totals.majuri,
      items: computedRows
        .filter((r) => r.description.trim() && Number(r.weight) > 0)
        .map((r) => ({
          description: r.description,
          weight: Number(r.weight),
          touch: Number(r.touch),
          purity: r.purity,
        })),
    };
    exportBillPdf(bill);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Billing</h1>
        <div className="flex gap-2">
          <button onClick={() => nav("/bills")} className="px-3 py-2 rounded bg-slate-200">
            View All Bills
          </button>
          <button disabled={saving} onClick={save} className="px-3 py-2 rounded bg-slate-900 text-white">
            {saving ? "Saving..." : "Save Bill"}
          </button>
          <button onClick={printBill} className="px-3 py-2 rounded bg-indigo-600 text-white">
            Print Bill
          </button>
          <button onClick={sendWhatsApp} className="px-3 py-2 rounded bg-green-600 text-white">
            Send WhatsApp
          </button>
          <button onClick={pdf} className="px-3 py-2 rounded bg-amber-600 text-white">
            Generate PDF
          </button>
        </div>
      </div>

      {/* TOP FORM (Majuri Rate removed from here) */}
      <div className="grid grid-cols-3 gap-3 bg-white rounded-xl shadow p-4">
        <div>
          <label className="text-sm font-medium">Customer Name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mobile Number</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            className="mt-1 w-full border rounded px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {lastSavedBill && (
          <div className="col-span-3 text-sm p-2 bg-green-50 rounded">
            Saved: <b>{lastSavedBill.billNo}</b>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 w-16">SR.NO</th>
              <th className="p-2 text-left">Item/Description</th>
              <th className="p-2 w-40">Weight (g)</th>
              <th className="p-2 w-40">Touch (%)</th>
              <th className="p-2 w-40">Purity</th>
            </tr>
          </thead>
          <tbody>
            {computedRows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 text-center">{i + 1}</td>

                <td className="p-2">
                  <input
                    ref={(el) => setCellRef(i, 0, el)}
                    className="w-full border rounded px-2 py-1"
                    value={rows[i]?.description ?? ""}
                    onChange={(e) => updateRow(i, { description: e.target.value })}
                    onKeyDown={(e) => onKeyDown(e, i, 0)}
                    placeholder="e.g. 454 / Chain"
                  />
                </td>

                <td className="p-2">
                  <input
                    ref={(el) => setCellRef(i, 1, el)}
                    className="w-full border rounded px-2 py-1 text-right"
                    value={rows[i]?.weight ?? ""}
                    onChange={(e) => updateRow(i, { weight: e.target.value })}
                    onKeyDown={(e) => onKeyDown(e, i, 1)}
                    placeholder="0.00"
                  />
                </td>

                <td className="p-2">
                  <input
                    ref={(el) => setCellRef(i, 2, el)}
                    className="w-full border rounded px-2 py-1 text-right"
                    value={rows[i]?.touch ?? ""}
                    onChange={(e) => updateRow(i, { touch: e.target.value })}
                    onKeyDown={(e) => onKeyDown(e, i, 2)}
                    placeholder="0.00"
                  />
                </td>

                <td className="p-2 text-right pr-4">{r.purity.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ SUMMARY UNDER TABLE (Majuri Rate moved here) */}
        <div className="border-t p-3 grid grid-cols-4 gap-3 text-sm bg-slate-50">
          <div className="p-2 bg-white rounded">
            Total Weight: <b>{totals.totalWeight.toFixed(2)} g</b>
          </div>

          <div className="p-2 bg-white rounded">
            Total Purity: <b>{totals.totalPurity.toFixed(2)} g</b>
          </div>

          <div className="p-2 bg-white rounded">
            <div className="flex items-center justify-between gap-2">
              <span>Majuri Rate:</span>
              <input
                className="w-28 border rounded px-2 py-1 text-right"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="p-2 bg-white rounded">
            Majuri: <b>₹{totals.majuri.toFixed(0)}</b>
          </div>
        </div>

        <div className="p-3 text-xs text-slate-500">ENTER: next column → last column → next row (auto new row).</div>
      </div>
    </div>
  );
}