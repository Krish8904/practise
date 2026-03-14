import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function getNextInvoiceNumber(company) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoice-number/${encodeURIComponent(company)}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch invoice number");
  const { invNum } = await res.json();
  return invNum;
}

const fmt = (num) =>
  num == null ? "0.00" : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

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

  // ── Colors — same hues, higher contrast ──
  const INK      = [15,  15,  22];    // deeper black
  const MID      = [70,  70,  88];    // darker mid
  const LIGHT    = [120, 120, 138];   // darker "light" so labels are readable
  const BORDER   = [195, 200, 210];   // slightly darker border
  const ROW_ALT  = [244, 246, 250];
  const GREEN    = [16,  140,  60];   // richer green
  const RED      = [200,  25,  25];   // deeper red
  const BLUE     = [67,  56,  220];   // richer indigo
  const HDR_BG   = [20,  22,  34];    // slightly darker header
  const HDR_TEXT = [248, 249, 252];   // brighter white text
  const HDR_SUB  = [195, 197, 218];   // brighter company name
  const HDR_DIM  = [130, 132, 158];   // brighter dim text

  // ════════════════════════════════
  //  drawHeader — taller, more spacious
  // ════════════════════════════════
  const drawHeader = (pageNum) => {
    doc.setFillColor(...HDR_BG);
    doc.rect(0, 0, PW, 38, "F");

    // Thicker indigo accent line
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, PW, 2, "F");

    // "Ledger" — bigger, bolder
    B(26);
    doc.setTextColor(...HDR_TEXT);
    doc.text("Ledger", 14, 22);

    // Company name
    N(12);
    doc.setTextColor(...HDR_SUB);
    const compLine = doc.splitTextToSize(company, 110)[0];
    doc.text(compLine, 14, 30);

    // Invoice ID — right
    N(7);
    doc.setTextColor(...HDR_DIM);
    doc.text("Invoice ID", PW - 14, 17, { align: "right" });
    B(10);
    doc.setTextColor(215, 217, 238);
    doc.text(invNum, PW - 14, 24, { align: "right" });

    // Period — right, below invoice ID
    N(8);
    doc.setTextColor(...HDR_TEXT);
    doc.text(dateRange, PW - 14, 31, { align: "right" });

    if (pageNum > 1) {
      N(7);
      doc.setTextColor(...HDR_DIM);
      doc.text(`Page ${pageNum}`, PW - 14, 36, { align: "right" });
    }
  };

  // ════════════════════════════════
  //  Summary — taller boxes, bigger text
  // ════════════════════════════════
  const drawSummary = () => {
    const Y = 44;
    const H = 22;
    const GAP = 3;
    const W = (PW - 28 - GAP * 3) / 4;

    const items = [
      { label: "Opening Balance", value: previousBalance, color: INK  },
      { label: "Total Debits",    value: -invoiceAmount,  color: RED  },
      { label: "Total Credits",   value: paymentAmount,   color: GREEN},
      { label: "Closing Balance", value: closingBalance,  color: closingBalance < 0 ? RED : GREEN },
    ];

    items.forEach((item, i) => {
      const x = 14 + i * (W + GAP);

      // White fill + visible border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.4);
      doc.rect(x, Y, W, H, "FD");

      // Coloured top bar (3mm thick)
      doc.setFillColor(...(i === 0 ? [180, 182, 200] : item.color));
      doc.rect(x, Y, W, 3, "F");

      // Label — darker, more readable
      N(7);
      doc.setTextColor(...LIGHT);
      doc.text(item.label, x + 4, Y + 10);

      // Value — larger
      B(12);
      doc.setTextColor(...item.color);
      const sign = item.value < 0 ? "−" : "";
      doc.text(`${sign}₹${fmt(Math.abs(item.value))}`, x + 4, Y + 18);
    });

    return Y + H;
  };

  // ════════════════════════════════
  //  Page 1
  // ════════════════════════════════
  drawHeader(1);
  const summaryBottom = drawSummary();

  const secY = summaryBottom + 6;
  // Section label above rule
  N(7);
  doc.setTextColor(...LIGHT);
  doc.text("TRANSACTION DETAIL", 14, secY - 1.5);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.35);
  doc.line(14, secY, PW - 14, secY);

  // ════════════════════════════════
  //  Table rows
  // ════════════════════════════════
  const tableBody = [];

  tableBody.push([
    { content: "", styles: { fontSize: 6 } },
    { content: applied.from ? fmtDate(applied.from) : "—", styles: { textColor: LIGHT, fontSize: 7.5 } },
    { content: "Opening Balance", styles: { textColor: BLUE, fontStyle: "bold", fontSize: 8 } },
    { content: "", styles: {} },
    { content: "", styles: {} },
    { content: "", styles: {} },
    {
      content: `${previousBalance < 0 ? "−" : ""}₹${fmt(Math.abs(previousBalance))}`,
      styles: { halign: "right", fontStyle: "bold", fontSize: 8, textColor: previousBalance < 0 ? RED : INK },
    },
  ]);

  ledgerRows.forEach((row, idx) => {
    const isDebit  = row.ledgerAmount < 0;
    const isCredit = row.ledgerAmount > 0;
    tableBody.push([
      { content: String(idx + 1), styles: { textColor: LIGHT, fontSize: 7, halign: "center" } },
      { content: fmtDate(row.date), styles: { textColor: MID, fontSize: 7.5 } },
      { content: row.description || "—", styles: { textColor: INK, fontSize: 8 } },
      {
        content: row.typeLabel || row.type || "—",
        styles: { fontSize: 7, fontStyle: "bold", textColor: isCredit ? GREEN : isDebit ? RED : LIGHT },
      },
      {
        content: isDebit ? `₹${fmt(Math.abs(row.ledgerAmount))}` : "",
        styles: { halign: "right", fontSize: 8, textColor: RED, fontStyle: "bold" },
      },
      {
        content: isCredit ? `₹${fmt(row.ledgerAmount)}` : "",
        styles: { halign: "right", fontSize: 8, textColor: GREEN, fontStyle: "bold" },
      },
      {
        content: `${row.closingBalance < 0 ? "−" : ""}₹${fmt(Math.abs(row.closingBalance))}`,
        styles: { halign: "right", fontSize: 8, fontStyle: "bold", textColor: row.closingBalance < 0 ? RED : INK },
      },
    ]);
  });

  autoTable(doc, {
    startY: secY + 2,
    head: [[
      { content: "#",          styles: { halign: "center" } },
      { content: "Date"        },
      { content: "Description" },
      { content: "Type"        },
      { content: "Debit",      styles: { halign: "right" } },
      { content: "Credit",     styles: { halign: "right" } },
      { content: "Balance",    styles: { halign: "right" } },
    ]],
    body: tableBody,
    theme: "plain",
    styles: {
      font: F,
      fontSize: 8,
      cellPadding: { top: 3.8, bottom: 3.8, left: 3.5, right: 3.5 },
      lineWidth: 0,
      overflow: "ellipsize",
    },
    headStyles: {
      font: F,
      fontStyle: "bold",
      fontSize: 7.5,
      fillColor: [228, 230, 238],   // darker head bg
      textColor: MID,
      cellPadding: { top: 4, bottom: 4, left: 3.5, right: 3.5 },
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
        data.cell.styles.fillColor = data.row.index % 2 === 0 ? [255, 255, 255] : ROW_ALT;
      }
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.line(
          data.cell.x, data.cell.y + data.cell.height,
          data.cell.x + data.cell.width, data.cell.y + data.cell.height
        );
      }
    },
    didDrawPage: (data) => {
      N(7);
      doc.setTextColor(...LIGHT);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);
      doc.line(14, PH - 12, PW - 14, PH - 12);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, PH - 7.5);
      doc.text(invNum, PW / 2, PH - 7.5, { align: "center" });
      doc.text(`Page ${data.pageNumber}`, PW - 14, PH - 7.5, { align: "right" });
      if (data.pageNumber > 1) drawHeader(data.pageNumber);
    },
    margin: { top: 50, left: 14, right: 14, bottom: 16 },
  });

  // ── Closing balance strip — taller, bolder ──
  const endY = (doc.lastAutoTable.finalY || 200) + 5;
  if (endY < PH - 30) {
    const BOX_H = 22;

    doc.setFillColor(238, 240, 246);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.rect(14, endY, PW - 28, BOX_H, "FD");

    // Left — transactions
    N(7);
    doc.setTextColor(...LIGHT);
    doc.text("TRANSACTIONS", 18, endY + 8);
    B(12);
    doc.setTextColor(...INK);
    doc.text(String(ledgerRows.length), 18, endY + 17);

    // Middle — period
    const midX = PW / 2;
    N(7);
    doc.setTextColor(...LIGHT);
    doc.text("PERIOD", midX, endY + 8, { align: "center" });
    B(9);
    doc.setTextColor(...MID);
    doc.text(dateRange, midX, endY + 17, { align: "center" });

    // Vertical dividers
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(PW / 2 - 35, endY + 3, PW / 2 - 35, endY + BOX_H - 3);
    doc.line(PW / 2 + 35, endY + 3, PW / 2 + 35, endY + BOX_H - 3);

    // Right — closing balance
    N(7);
    doc.setTextColor(...LIGHT);
    doc.text("CLOSING BALANCE", PW - 18, endY + 8, { align: "right" });
    B(13);
    doc.setTextColor(...(closingBalance < 0 ? RED : GREEN));
    const closingSign = closingBalance < 0 ? "−" : "";
    doc.text(`${closingSign}₹${fmt(Math.abs(closingBalance))}`, PW - 18, endY + 17, { align: "right" });
  }

  doc.save(`Ledger_${company}_${invNum}.pdf`);
}