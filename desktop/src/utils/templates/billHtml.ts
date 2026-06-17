import { SHOP } from "../shop";

export function buildBillHtml(bill: any) {
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: "Mangal","Noto Sans Devanagari","Segoe UI", Arial; padding: 24px; color:#111; }
        .card { border:1px solid #e5e7eb; border-radius:12px; padding:16px; }
        .center { text-align:center; }
        .muted { color:#6b7280; font-size:12px; }
        .title { font-size:18px; font-weight:700; margin:0; }
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
          <div class="title">${SHOP.top}</div>
          <div class="h1">${SHOP.name}</div>
          <div class="muted">${SHOP.addr1}<br/>${SHOP.addr2}<br/>${SHOP.addr3}</div>
          <div class="muted" style="margin-top:6px;">${SHOP.prop}<br/>${SHOP.mob}</div>
          <hr/>
          <div style="font-weight:700;">${SHOP.serviceTitle}</div>
        </div>

        <hr/>

        <div style="font-size:13px; line-height:1.6;">
          <div><b>Bill No</b> : ${bill.billNo}</div>
          <div><b>Date</b> : ${bill.billDate}</div>
          <div><b>Customer</b> : ${bill.customerName}</div>
          <div><b>Mobile</b> : ${bill.customerMobile}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:60px;">SR.NO</th>
              <th>Item/Description</th>
              <th class="right" style="width:110px;">Wt(g)</th>
              <th class="right" style="width:110px;">Tch(%)</th>
              <th class="right" style="width:110px;">Pur(g)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map((it: any, i: number) => `
              <tr>
                <td>${i + 1}</td>
                <td>${it.description}</td>
                <td class="right">${Number(it.weight).toFixed(2)}</td>
                <td class="right">${Number(it.touch).toFixed(2)}</td>
                <td class="right">${Number(it.purity).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="margin-top:10px; font-size:13px; line-height:1.8;">
          <div><b>Total Weight</b> : ${Number(bill.totalWeight).toFixed(2)} g</div>
          <div><b>Total Purity</b> : ${Number(bill.totalPurity).toFixed(2)} g</div>
          <div><b>Majuri</b> : ₹${Math.round(Number(bill.majuri))}</div>
        </div>

        <hr/>
        <div class="center" style="font-weight:700;">Thank You Visit Again</div>
      </div>
    </body>
  </html>`;
}