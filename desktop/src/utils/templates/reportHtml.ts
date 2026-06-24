export function buildItemDetailReportHtml(payload: {
  from: string;
  to: string;
  data: any; // ItemDetailReportResponse
}) {
  const d = payload.data || {};
  const rows = d.rows || [];

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Item Detail Report</title>
      <style>
        body { font-family: "Segoe UI", Arial; padding: 18px; color:#111; }
        .title { font-size:18px; font-weight:800; margin:0 0 6px; }
        .meta { font-size:12px; color:#374151; line-height:1.6; }
        .cards { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-top:12px; }
        .card { border:1px solid #e5e7eb; border-radius:10px; padding:10px; font-size:12px; }
        table { width:100%; border-collapse:collapse; margin-top:12px; }
        th, td { border:1px solid #e5e7eb; padding:7px; font-size:12px; }
        th { background:#f3f4f6; text-align:left; }
        .r { text-align:right; }
        .footer { margin-top:12px; padding-top:10px; border-top:1px solid #e5e7eb; font-size:12px; }
      </style>
    </head>
    <body>
      <div class="title">Item Detail Report</div>
      <div class="meta">
        <div><b>From</b>: ${payload.from}</div>
        <div><b>To</b>: ${payload.to}</div>
      </div>

      <div class="cards">
        <div class="card"><b>Total Bills</b><br/>${d.totalBills ?? 0}</div>
        <div class="card"><b>Total Items</b><br/>${d.totalItems ?? 0}</div>
        <div class="card"><b>Total Weight</b><br/>${Number(d.totalWeight ?? 0).toFixed(2)} g</div>
        <div class="card"><b>Total Purity</b><br/>${Number(d.totalPurity ?? 0).toFixed(2)} g</div>
        <div class="card"><b>Total Majuri</b><br/>Rs.${Math.round(Number(d.totalMajuri ?? 0))}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:110px;">Date</th>
            <th style="width:120px;">Bill No</th>
            <th>Item/Description</th>
            <th class="r" style="width:110px;">Weight</th>
            <th class="r" style="width:110px;">Touch</th>
            <th class="r" style="width:110px;">Purity</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r:any) => `
            <tr>
              <td>${r.billDate}</td>
              <td>${r.billNo}</td>
              <td>${r.description}</td>
              <td class="r">${Number(r.weight).toFixed(2)}</td>
              <td class="r">${Number(r.touch).toFixed(2)}</td>
              <td class="r">${Number(r.purity).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="footer">
        <b>Summary:</b>
        Total Weight ${Number(d.totalWeight ?? 0).toFixed(2)} g |
        Total Purity ${Number(d.totalPurity ?? 0).toFixed(2)} g |
        Total Majuri Rs.${Math.round(Number(d.totalMajuri ?? 0))}
      </div>
    </body>
  </html>`;
}