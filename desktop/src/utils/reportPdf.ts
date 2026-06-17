// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { SHOP } from "./shop";

// export function exportItemWiseReportPdf(payload: {
//   from: string;
//   to: string;
//   summary: any;
//   items: any[];
// }) {
//   const doc = new jsPDF();

//   // Header (Shop Details)
//   doc.setFontSize(12);
//   doc.text(SHOP.titleTop, 14, 10);

//   doc.setFontSize(16);
//   doc.text(SHOP.name, 14, 18);

//   doc.setFontSize(10);
//   doc.text(SHOP.line1, 14, 24);
//   doc.text(SHOP.line2, 14, 29);
//   doc.text(SHOP.line3, 14, 34);
//   doc.text(SHOP.prop, 14, 40);
//   doc.text(SHOP.mob, 14, 45);

//   doc.setFontSize(14);
//   doc.text("Item-wise Report", 14, 55);

//   doc.setFontSize(10);
//   doc.text(`From: ${payload.from}`, 14, 61);
//   doc.text(`To: ${payload.to}`, 14, 67);

//   const totalBills = Number(payload.summary?.totalBills ?? 0);
//   const totalWeight = Number(payload.summary?.totalWeight ?? 0);
//   const totalPurity = Number(payload.summary?.totalPurity ?? 0);
//   const totalMajuri = Number(payload.summary?.totalMajuri ?? 0);

//   doc.text(`Total Bills: ${totalBills}`, 14, 75);
//   doc.text(`Total Weight: ${totalWeight.toFixed(2)} g`, 14, 81);
//   doc.text(`Total Purity: ${totalPurity.toFixed(2)} g`, 14, 87);
//   doc.text(`Total Majuri: ₹${Math.round(totalMajuri)}`, 14, 93);

//   autoTable(doc, {
//     startY: 100,
//     head: [["Item/Description", "Count", "Total Weight", "Total Purity"]],
//     body: payload.items.map((r) => [
//       String(r.description ?? ""),
//       String(r.itemCount ?? 0),
//       Number(r.totalWeight ?? 0).toFixed(2),
//       Number(r.totalPurity ?? 0).toFixed(2),
//     ]),
//   });

//   doc.save(`RK_ItemWiseReport_${payload.from}_${payload.to}.pdf`);
// }