import { SHOP } from "./shop";

export function buildItemWiseReportHtml(payload: {
  from: string;
  to: string;
  summary: any;
  items: any[];
}) {
  const totalBills = Number(payload.summary?.totalBills ?? 0);
  const totalWeight = Number(payload.summary?.totalWeight ?? 0);
  const totalPurity = Number(payload.summary?.totalPurity ?? 0);
  const totalMajuri = Number(payload.summary?.totalMajuri ?? 0);

  const lines = [
    SHOP.titleTop,
    "",
    SHOP.name,
    SHOP.line1,
    SHOP.line2,
    SHOP.line3,
    "",
    SHOP.prop,
    SHOP.mob,
    "",
    "--------------------------------",
    "Item-wise Report",
    "--------------------------------",
    `From: ${payload.from}`,
    `To  : ${payload.to}`,
    "",
    `Total Bills  : ${totalBills}`,
    `Total Weight : ${totalWeight.toFixed(2)} g`,
    `Total Purity : ${totalPurity.toFixed(2)} g`,
    `Total Majuri : ₹${Math.round(totalMajuri)}`,
    "--------------------------------",
    "Item                Cnt   Wt(g)    Pur(g)",
    "--------------------------------",
    ...payload.items.map((r) => {
      const desc = String(r.description ?? "").slice(0, 16).padEnd(16, " ");
      const cnt = String(r.itemCount ?? 0).padStart(3, " ");
      const wt = Number(r.totalWeight ?? 0).toFixed(2).padStart(7, " ");
      const pur = Number(r.totalPurity ?? 0).toFixed(2).padStart(7, " ");
      return `${desc} ${cnt}  ${wt}  ${pur}`;
    }),
    "--------------------------------",
    "Thank You Visit Again",
  ];

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>RK Report</title>
      <style>
        body { font-family: monospace; padding: 10px; }
        pre { font-size: 12px; line-height: 1.25; white-space: pre-wrap; }
      </style>
    </head>
    <body><pre>${lines.join("\n")}</pre></body>
  </html>`;
}