import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportBillPdf(bill: any) {
  const doc = new jsPDF();

  doc.setFontSize(12);
  doc.text("|| श्री ||", 14, 12);
  doc.setFontSize(16);
  doc.text("RK REFINERY", 14, 20);
  doc.setFontSize(10);
  doc.text("Silver Exchange", 14, 26);

  doc.text(`Bill No: ${bill.billNo}`, 14, 34);
  doc.text(`Date: ${bill.billDate}`, 14, 40);
  doc.text(`Customer: ${bill.customerName}`, 14, 46);
  doc.text(`Mobile: ${bill.customerMobile}`, 14, 52);

  autoTable(doc, {
    startY: 58,
    head: [["SR.NO", "Item/Description", "Wt(g)", "Tch(%)", "Pur(g)"]],
    body: bill.items.map((it: any, i: number) => [
      String(i + 1),
      it.description,
      Number(it.weight).toFixed(2),
      Number(it.touch).toFixed(2),
      Number(it.purity).toFixed(2),
    ]),
  });

  const y = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Weight: ${Number(bill.totalWeight).toFixed(2)} g`, 14, y);
  doc.text(`Total Purity: ${Number(bill.totalPurity).toFixed(2)} g`, 14, y + 6);
  doc.text(`Majuri: ₹${Number(bill.majuri).toFixed(0)}`, 14, y + 12);

  doc.save(`${bill.billNo}_${bill.billDate}.pdf`);
}
