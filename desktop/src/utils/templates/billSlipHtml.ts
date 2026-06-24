export function buildBillSlipHtml(bill: any, paperWidth: "72" | "80" = "72") {
  const W = paperWidth === "72" ? 42 : 48;
  const col = paperWidth === "72"
    ? { sr: 2, item: 8, wt: 9, tch: 6, pur: 9 }
    : { sr: 2, item: 12, wt: 10, tch: 7, pur: 10 };

  const padRight = (s: any, n: number) => {
    s = String(s ?? "");
    if (s.length >= n) return s.slice(0, n);
    return s + " ".repeat(n - s.length);
  };
  const padLeft = (s: any, n: number) => {
    s = String(s ?? "");
    if (s.length >= n) return s.slice(0, n);
    return " ".repeat(n - s.length) + s;
  };
  const hr = "-".repeat(W);

  const rowLine = (sr: any, item: any, wt: any, tch: any, pur: any) =>
    `${padLeft(sr, col.sr)} ${padRight(item, col.item)} ${padLeft(wt, col.wt)} ${padLeft(tch, col.tch)} ${padLeft(pur, col.pur)}`;

  const lines: string[] = [];
  lines.push("|| श्री ||");
  lines.push("R.K.REFINERY Silver Exchange");
  lines.push("Mangal Katta Complex, 1st Floor, Shop No 6 &");
  lines.push("7, Shroff Bazar, ADONI");
  lines.push("518301, Kurnool dist");
  lines.push("Prop: Anil | Mob: 9615889191, 7033654242");
  lines.push(hr);
  lines.push(`Bill No: ${bill.billNo}`);
  lines.push(`Date: ${bill.billDate}`);
  lines.push(`Name: ${bill.customerName}`);
  lines.push(`Mobile: ${bill.customerMobile}`);
  lines.push(hr);
  lines.push(rowLine("#", "Item", "Wt", "Tch", "Pur"));
  lines.push(hr);

  (bill.items || []).forEach((it: any, idx: number) => {
    lines.push(
      rowLine(
        idx + 1,
        it.description,
        Number(it.weight || 0).toFixed(2),
        Number(it.touch || 0).toFixed(2),
        Number(it.purity || 0).toFixed(2)
      )
    );
  });

  lines.push(hr);
  lines.push(`Total Weight: ${Number(bill.totalWeight || 0).toFixed(2)} g`);
  lines.push(`Total Purity: ${Number(bill.totalPurity || 0).toFixed(2)} g`);
  lines.push(`Total Majuri: Rs.${Math.round(Number(bill.majuri || 0))}`);
  // lines.push(`Total Majuri: Rs.${Math.round(Number(bill.majuri || 0))}`);
  lines.push("");
  lines.push("Thank You Visit Again");

  const text = lines.join("\n");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { margin: 6mm; }
        body { font-family: "Consolas","Courier New",monospace; padding: 8px; }
        pre { font-size: 12px; line-height: 1.15; white-space: pre; }
      </style>
    </head>
    <body>
      <pre>${text}</pre>
    </body>
  </html>`;
}