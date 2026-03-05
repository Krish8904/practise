import React, { useState, useRef, useEffect } from "react";
import { FileDown, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtNum = (n) => {
  if (n == null || n === "") return "";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const headers = [
  "Sr.", "Tx ID", "Date", "Company", "Type", "Department",
  "Counterparty", "Description", "Account", "Amount",
  "Currency", "FX", "INR Amount", "Country",
];

const ExpenseExport = ({ data, fileName = "ExpenseInquiries" }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const rows = data.map((e, index) => [
      index + 1,
      e.transactionId || "",
      fmtDate(e.date),
      e.company || "",
      e.type || "",
      e.department || "",
      e.counterparty || "",
      e.description || "",
      e.account || "",
      fmtNum(e.amount),
      e.currency || "INR",
      e.fx ?? 1,
      fmtNum(e.inrAmount),
      e.country || "",
    ]);

    if (format === "pdf") {
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoBase64 = "/newlogo.png";
      const header = () => {
        doc.addImage(logoBase64, "WEBP", 10, 0, 44, 34);
        doc.setFontSize(27);
        doc.setFont("helvetica", "bold");
        doc.text("SubDuxion", pageWidth - 15, 20, { align: "right" });
      };
      const footer = (pageNumber, totalPages) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const exportTime = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const formattedTime = `${pad(exportTime.getDate())}-${pad(exportTime.getMonth() + 1)}-${exportTime.getFullYear()} ${pad(exportTime.getHours())}:${pad(exportTime.getMinutes())}:${pad(exportTime.getSeconds())}`;
        doc.text(`Exported on ${formattedTime}`, 10, pageHeight - 10);
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
      };
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
        columnStyles: {
          9: { halign: "right" },
          11: { halign: "right" },
          12: { halign: "right" },
        },
        didDrawPage: () => {
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const totalPages = doc.internal.getNumberOfPages();
          header();
          footer(pageNumber, totalPages);
        },
      });
      doc.save(`${fileName}.pdf`);
    }

    if (format === "xlsx") {
      const worksheetData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const numericCols = [9, 11, 12];
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 1; R <= range.e.r; R++) {
        numericCols.forEach((C) => {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[addr]) ws[addr].t = "n";
        });
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expense Inquiries");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    if (format === "docx") {
      const tableRows = [
        new TableRow({
          children: headers.map((h) =>
            new TableCell({
              width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: h, bold: true })],
            })
          ),
        }),
        ...rows.map((row) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({ children: [new Paragraph(String(cell))] })
            ),
          })
        ),
      ];
      const docFile = new Document({
        sections: [{ children: [new Table({ rows: tableRows })] }],
      });
      const blob = await Packer.toBlob(docFile);
      saveAs(blob, `${fileName}.docx`);
    }
  };

  return (
    <div ref={exportRef} className="relative w-full">
      {/* Export row */}
      <div
        onClick={() => setExportOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
      >
        <FileDown size={16} />
        Export
        <ChevronDown
          size={13}
          className="ml-auto opacity-50 transition-transform"
          style={{ transform: exportOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>


      {exportOpen && (
        <div
          className="absolute center-full top-0 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 mr-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <div
            onClick={() => { handleExport("pdf"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
          >
            PDF (.pdf)
          </div>
          <div className="border-t border-gray-100" />
          <div
            onClick={() => { handleExport("xlsx"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
          >
            Excel (.xlsx)
          </div>
          <div className="border-t border-gray-100" />
          <div
            onClick={() => { handleExport("docx"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
          >
            Word (.docx)
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseExport;