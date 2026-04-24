import { type UserInvoice } from "../api/interfaces/finance";

export function formatEuros(amount: number, lang: string = "en-US"): string {
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr?: string, lang: string = "fr-FR"): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(lang);
}

export function getInvoiceDescription(
  inv: UserInvoice,
  lang: string = "fr-FR",
): string {
  switch (inv.type) {
    case "transaction":
      return inv.item_title ?? "—";
    case "subscription":
      return `${formatDate(inv.sub_from, lang)} → ${formatDate(inv.sub_to, lang)}`;
    case "ad":
      return inv.post_title ? `Post #${inv.post_id} — ${inv.post_title}` : "—";
    case "event":
      return inv.event_title
        ? `Event #${inv.event_id} — ${inv.event_title}`
        : "—";
    default:
      return "—";
  }
}

export function getInvoiceDetails(
  inv: UserInvoice,
  lang: string = "en-US",
): string {
  switch (inv.type) {
    case "transaction":
      return `Price: ${formatEuros(inv.item_price ?? 0, lang)} · Commission: ${formatEuros(inv.commission ?? 0, lang)}`;
    case "ad":
      return `${formatDate(inv.ad_start_date, lang)} → ${formatDate(inv.ad_end_date, lang)}`;
    default:
      return "";
  }
}

function buildInvoiceTable(invoice: UserInvoice): string {
  switch (invoice.type) {
    case "transaction":
      return `
        <table>
          <tr><th>Item</th><th>Item Price</th><th>Commission Paid</th><th>Total Paid</th></tr>
          <tr>
            <td>${invoice.item_title ?? "—"}</td>
            <td>${formatEuros(invoice.item_price ?? 0)}</td>
            <td>${formatEuros(invoice.commission ?? 0)}</td>
            <td>${formatEuros(invoice.amount)}</td>
          </tr>
        </table>`;

    case "subscription":
      return `
        <table>
          <tr><th>Plan</th><th>Start Date</th><th>End Date</th><th>Total Paid</th></tr>
          <tr>
            <td>Premium Subscription</td>
            <td>${formatDate(invoice.sub_from)}</td>
            <td>${formatDate(invoice.sub_to)}</td>
            <td>${formatEuros(invoice.amount)}</td>
          </tr>
        </table>`;

    case "ad":
      return `
        <table>
          <tr><th>Post ID</th><th>Post Title</th><th>Start Date</th><th>End Date</th><th>Total Paid</th></tr>
          <tr>
            <td>#${invoice.post_id ?? "—"}</td>
            <td>${invoice.post_title ?? "—"}</td>
            <td>${formatDate(invoice.ad_start_date)}</td>
            <td>${formatDate(invoice.ad_end_date)}</td>
            <td>${formatEuros(invoice.amount)}</td>
          </tr>
        </table>`;

    case "event":
      return `
        <table>
          <tr><th>Event ID</th><th>Event Title</th><th>Total Paid</th></tr>
          <tr>
            <td>#${invoice.event_id ?? "—"}</td>
            <td>${invoice.event_title ?? "—"}</td>
            <td>${formatEuros(invoice.amount)}</td>
          </tr>
        </table>`;

    default:
      return "";
  }
}

export function generateInvoicePDF(
  invoice: UserInvoice,
  username: string,
): void {
  const invoiceRef = invoice.id_transaction ?? `${invoice.type}-${invoice.id}`;
  const html = `
    <!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>Invoice ${invoiceRef}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      h1 { color: #c0392b; }
      .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #f0f0f0; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
      td { padding: 10px; border-bottom: 1px solid #eee; }
      .total { font-weight: bold; font-size: 16px; margin-top: 24px; text-align: right; }
      .footer { margin-top: 48px; font-size: 12px; color: #aaa; }
    </style></head><body>
    <h1>UpcycleConnect</h1>
    <span class="badge">${invoice.type}</span>
    <p class="meta">Invoice N° ${invoiceRef}<br>Date: ${formatDate(invoice.created_at)}<br>Customer: ${username}</p>
    ${buildInvoiceTable(invoice)}
    <p class="total">Total: ${formatEuros(invoice.amount)}</p>
    <p class="footer">UpcycleConnect — 21 rue Erard, 75012 Paris — support@upagain.com</p>
    </body></html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice_${invoiceRef}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
