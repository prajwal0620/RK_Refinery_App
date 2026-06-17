import { SHOP } from "../shop";

export function buildItemDetailReportHtml(payload: {
  from: string;
  to: string;
  data: any; // ItemDetailReportResponse
}) {
  const d = payload.data;
  const rows = d?.rows ?? [];

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: "Mangal","Segoe UI", Arial; padding: 24px; color:#111; }
        .card { border:1px solid #e5e7eb; border-radius:12px; padding:16px; }
        .center { text-align:center; }
        .muted { color:#6b7280; font-size:12px; }
        .h1 { font-size:22px; font-weight:800; margin:4px 0; }
        hr { border:none; border-top:1px solid #e5e7eb; margin:12px 0; }
        table { width:100%; border-collapse:collapse; margin-top:10px; }
        th, td { border:1px solid #e5e7eb; padding:8px; font-size:12px; }
        th { background:#f3f4f6; text-align:left; }
        .right { text-align:right; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="center">
          <div style="font-weight:700;">${SHOP.top}</div>
          <div class="h1">${SHOP.name}</div>
          <div class="muted">${SHOP.addr1}<br/>${SHOP.addr2}<br/>${SHOP.addr3}</div>
          <div class="muted" style="margin-top:6px;">${SHOP.prop}<br/>${SHOP.mob}</div>
        </div>

        <hr/>
        <div style="font-size:18px; font-weight:800;">Item Detail Report</div>
        <div style="font-size:13px; margin-top:6px;">
          <div><b>From</b>: ${payload.from}</div>
          <div><b>To</b>: ${payload.to}</div>
        </div>

        <div style="margin-top:10px; font-size:13px; line-height:1.8;">
          <div><b>Total Bills</b>: ${d?.totalBills ?? 0}</div>
          <div><b>Total Items</b>: ${d?.totalItems ?? 0}</div>
          <div><b>Total Weight</b>: ${Number(d?.totalWeight ?? 0).toFixed(2)} g</div>
          <div><b>Total Purity</b>: ${Number(d?.totalPurity ?? 0).toFixed(2)} g</div>
          <div><b>Total Majuri</b>: ₹${Math.round(Number(d?.totalMajuri ?? 0))}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:110px;">Date</th>
              <th style="width:120px;">Bill No</th>
              <th>Item/Description</th>
              <th class="right" style="width:110px;">Weight</th>
              <th class="right" style="width:110px;">Touch</th>
              <th class="right" style="width:110px;">Purity</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r:any) => `
              <tr>
                <td>${r.billDate}</td>
                <td>${r.billNo}</td>
                <td>${r.description}</td>
                <td class="right">${Number(r.weight).toFixed(2)}</td>
                <td class="right">${Number(r.touch).toFixed(2)}</td>
                <td class="right">${Number(r.purity).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <hr/>
        <div style="font-size:13px;">
          <b>Summary:</b>
          Total Weight ${Number(d?.totalWeight ?? 0).toFixed(2)} g |
          Total Purity ${Number(d?.totalPurity ?? 0).toFixed(2)} g |
          Total Majuri ₹${Math.round(Number(d?.totalMajuri ?? 0))}
        </div>
      </div>
    </body>
  </html>`;
}