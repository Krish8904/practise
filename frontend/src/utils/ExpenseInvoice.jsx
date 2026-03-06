import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// ── Fetch next invoice number from backend (persists across all devices) ──
async function getNextInvoiceNumber(company) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoice-number/${encodeURIComponent(company)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to fetch invoice number");
  const { invNum } = await res.json();
  return invNum;
}

const fmt = (num) =>
  num == null ? "0.00"
    : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

// ── Font cache ──
let cachedFont = null;
async function loadFont() {
  if (cachedFont) return cachedFont;
  const urls = [
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
    "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const magic = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
      if (magic !== 0x00010000 && magic !== 0x74727565 && magic !== 0x4F54544F) continue;
      let bin = "";
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      cachedFont = btoa(bin);
      return cachedFont;
    } catch (_) {}
  }
  return null;
}

export async function generateLedgerInvoice({
  company, applied, previousBalance, invoiceAmount,
  paymentAmount, closingBalance, ledgerRows,
}) {
  const invNum = await getNextInvoiceNumber(company);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();

  const fontB64 = await loadFont();
  const F = fontB64 ? "NotoSans" : "helvetica";
  if (fontB64) {
    doc.addFileToVFS("NotoSans-Regular.ttf", fontB64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.addFileToVFS("NotoSans-Bold.ttf", fontB64);
    doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  }

  const B = (sz) => { doc.setFont(F, "bold");   doc.setFontSize(sz); };
  const N = (sz) => { doc.setFont(F, "normal"); doc.setFontSize(sz); };

  const dateRange = `${applied.from ? fmtDate(applied.from) : "—"} – ${applied.to ? fmtDate(applied.to) : "—"}`;

  // ── Colors ──
  const INK      = [30,  30,  40];
  const MID      = [90,  90, 105];
  const LIGHT    = [160, 160, 175];
  const BORDER   = [210, 214, 220];
  const ROW_ALT  = [248, 249, 251];
  const GREEN    = [22,  163,  74];
  const RED      = [220,  38,  38];
  const BLUE     = [79,  70,  229];
  const HDR_BG   = [28,  30,  40];
  const HDR_TEXT = [240, 241, 245];

  // ════════════════════════════════
  //  drawHeader
  // ════════════════════════════════
  const drawHeader = (pageNum) => {
    // Dark header band
    doc.setFillColor(...HDR_BG);
    doc.rect(0, 0, PW, 32, "F");

    // Thin indigo accent line at very top
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, PW, 1.2, "F");

    // "Ledger" title — left
    B(23);
    doc.setTextColor(...HDR_TEXT);
    doc.text("Ledger", 14, 20);

    // Company name — left, below title
    N(13);
    doc.setTextColor(180, 182, 200);
    const compLine = doc.splitTextToSize(company, 110)[0];
    doc.text(compLine, 14, 27);

    // "Invoice ID" label
    N(6.5);
    doc.setTextColor(140, 142, 160);
    doc.text("Invoice ID", PW - 14, 17, { align: "right" });
    B(8.5);
    doc.setTextColor(200, 202, 220);
    doc.text(invNum, PW - 14, 22, { align: "right" });

    // Period — right
    N(7.5);
    doc.setTextColor(...HDR_TEXT);
    doc.text(dateRange, PW - 14, 27, { align: "right" });

    if (pageNum > 1) {
      N(6.5);
      doc.setTextColor(140, 142, 160);
      doc.text(`Page ${pageNum}`, PW - 14, 29, { align: "right" });
    }
  };

  // ════════════════════════════════
  //  Summary row (4 small boxes)
  // ════════════════════════════════
  const drawSummary = () => {
    const Y = 38;
    const H = 18;
    const W = (PW - 28 - 9) / 4; // 3 gaps of 3mm
    const items = [
      { label: "Opening Balance", value: previousBalance, color: INK },
      { label: "Total Debits",    value: -invoiceAmount,  color: RED },
      { label: "Total Credits",   value: paymentAmount,   color: GREEN },
      { label: "Closing Balance", value: closingBalance,  color: closingBalance < 0 ? RED : GREEN },
    ];

    items.forEach((item, i) => {
      const x = 14 + i * (W + 3);
      // box outline
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.rect(x, Y, W, H);

      // label
      N(6.5);
      doc.setTextColor(...LIGHT);
      doc.text(item.label, x + 4, Y + 6);

      // value — bold and larger
      B(11);
      doc.setTextColor(...item.color);
      const sign = item.value < 0 ? "−" : "";
      doc.text(`${sign}₹${fmt(Math.abs(item.value))}`, x + 4, Y + 14);
    });

    return Y + H; // returns bottom of summary
  };

  // ════════════════════════════════
  //  Page 1
  // ════════════════════════════════
  drawHeader(1);
  const summaryBottom = drawSummary();

  // Thin divider + section label
  const secY = summaryBottom + 5;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(14, secY, PW - 14, secY);

  // ════════════════════════════════
  //  Table body
  // ════════════════════════════════
  const tableBody = [];

  // Opening balance row
  tableBody.push([
    { content: "", styles: { fontSize: 6 } },
    { content: applied.from ? fmtDate(applied.from) : "—", styles: { textColor: LIGHT, fontSize: 7 } },
    { content: "Opening Balance", styles: { textColor: BLUE, fontStyle: "bold", fontSize: 7.5 } },
    { content: "", styles: {} },
    { content: "", styles: {} },
    { content: "", styles: {} },
    {
      content: `${previousBalance < 0 ? "−" : ""}₹${fmt(Math.abs(previousBalance))}`,
      styles: { halign: "right", fontStyle: "bold", fontSize: 7.5, textColor: previousBalance < 0 ? RED : INK },
    },
  ]);

  ledgerRows.forEach((row, idx) => {
    const isDebit  = row.ledgerAmount < 0;
    const isCredit = row.ledgerAmount > 0;
    tableBody.push([
      { content: String(idx + 1), styles: { textColor: LIGHT, fontSize: 6.5, halign: "center" } },
      { content: fmtDate(row.date), styles: { textColor: MID, fontSize: 7 } },
      { content: row.description || "—", styles: { textColor: INK, fontSize: 7.5 } },
      {
        content: (row.typeLabel || row.type || "—"),
        styles: {
          fontSize: 6.5,
          textColor: isCredit ? GREEN : isDebit ? RED : LIGHT,
        },
      },
      {
        content: isDebit ? `₹${fmt(Math.abs(row.ledgerAmount))}` : "",
        styles: { halign: "right", fontSize: 7.5, textColor: RED, fontStyle: "bold" },
      },
      {
        content: isCredit ? `₹${fmt(row.ledgerAmount)}` : "",
        styles: { halign: "right", fontSize: 7.5, textColor: GREEN, fontStyle: "bold" },
      },
      {
        content: `${row.closingBalance < 0 ? "−" : ""}₹${fmt(Math.abs(row.closingBalance))}`,
        styles: {
          halign: "right",
          fontSize: 7.5,
          fontStyle: "bold",
          textColor: row.closingBalance < 0 ? RED : INK,
        },
      },
    ]);
  });

  autoTable(doc, {
    startY: secY + 2,
    head: [[
      { content: "#",           styles: { halign: "center" } },
      { content: "Date"         },
      { content: "Description"  },
      { content: "Type"         },
      { content: "Debit",       styles: { halign: "right" } },
      { content: "Credit",      styles: { halign: "right" } },
      { content: "Balance",     styles: { halign: "right" } },
    ]],
    body: tableBody,
    theme: "plain",
    styles: {
      font: F,
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineWidth: 0,
      overflow: "ellipsize",
    },
    headStyles: {
      font: F,
      fontStyle: "bold",
      fontSize: 7,
      fillColor: [240, 241, 245],
      textColor: MID,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
    },
    columnStyles: {
      0: { cellWidth: 8  },
      1: { cellWidth: 22 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 24 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26 },
      6: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        // alternating row tint
        data.cell.styles.fillColor = data.row.index % 2 === 0 ? [255, 255, 255] : ROW_ALT;
      }
    },
    didDrawCell: (data) => {
      // bottom border on each row (subtle)
      if (data.section === "body") {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.15);
        doc.line(
          data.cell.x, data.cell.y + data.cell.height,
          data.cell.x + data.cell.width, data.cell.y + data.cell.height
        );
      }
    },
    didDrawPage: (data) => {
      // Footer on every page
      N(6.5);
      doc.setTextColor(...LIGHT);
      doc.line(14, PH - 12, PW - 14, PH - 12);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, PH - 8);
      doc.text(invNum, PW / 2, PH - 8, { align: "center" });
      doc.text(`Page ${data.pageNumber}`, PW - 14, PH - 8, { align: "right" });

      if (data.pageNumber > 1) drawHeader(data.pageNumber);
    },
    margin: { top: 46, left: 14, right: 14, bottom: 16 },
  });

  // ── Closing balance summary strip ──
  const endY = (doc.lastAutoTable.finalY || 200) + 5;
  if (endY < PH - 30) {
    const BOX_H = 18;
    doc.setFillColor(245, 246, 248);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.rect(14, endY, PW - 28, BOX_H);

    // Left side — meta info
    N(6.5);
    doc.setTextColor(...LIGHT);
    doc.text("TRANSACTIONS", 18, endY + 6);
    B(9);
    doc.setTextColor(...INK);
    doc.text(String(ledgerRows.length), 18, endY + 13);

    // Middle — period
    const midX = PW / 2;
    N(6.5);
    doc.setTextColor(...LIGHT);
    doc.text("PERIOD", midX, endY + 6, { align: "center" });
    B(8);
    doc.setTextColor(...MID);
    doc.text(dateRange, midX, endY + 13, { align: "center" });

    // Vertical dividers
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.line(PW / 2 - 35, endY + 2, PW / 2 - 35, endY + BOX_H - 2);
    doc.line(PW / 2 + 35, endY + 2, PW / 2 + 35, endY + BOX_H - 2);

    // Right side — closing balance
    N(6.5);
    doc.setTextColor(...LIGHT);
    doc.text("CLOSING BALANCE", PW - 18, endY + 6, { align: "right" });
    B(11);
    doc.setTextColor(...(closingBalance < 0 ? RED : GREEN));
    const closingSign = closingBalance < 0 ? "−" : "";
    doc.text(`${closingSign}₹${fmt(Math.abs(closingBalance))}`, PW - 18, endY + 14, { align: "right" });
  }

  doc.save(`Ledger_${company}_${invNum}.pdf`);
}