import React from "react";
import { FileDown } from "lucide-react";
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

const ExpenseExport = ({ data, fileName = "ExpenseInquiries" }) => {
  const headers = [
    "Sr.",
    "Tx ID",
    "Date",
    "Company",
    "Type",
    "Department",
    "Counterparty",
    "Description",
    "Account",
    "Amount",
    "Currency",
    "FX",
    "INR Amount",
    "Country",
  ];

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

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    /* ── PDF ── */
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
        const formattedTime = `${pad(exportTime.getDate())}-${pad(
          exportTime.getMonth() + 1
        )}-${exportTime.getFullYear()} ${pad(exportTime.getHours())}:${pad(
          exportTime.getMinutes()
        )}:${pad(exportTime.getSeconds())}`;

        doc.text(`Exported on ${formattedTime}`, 10, pageHeight - 10);
        doc.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: "right" }
        );
      };

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 0,
          fontStyle: "bold",
        },
        columnStyles: {
          9:  { halign: "right" }, // Amount
          11: { halign: "right" }, // FX
          12: { halign: "right" }, // INR Amount
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

    /* ── Excel ── */
    if (format === "xlsx") {
      const worksheetData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Right-align numeric columns (Amount, FX, INR Amount → cols J, L, M = indices 9,11,12)
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

    /* ── Word ── */
    if (format === "docx") {
      const tableRows = [
        new TableRow({
          children: headers.map(
            (h) =>
              new TableCell({
                width: {
                  size: Math.floor(100 / headers.length),
                  type: WidthType.PERCENTAGE,
                },
                children: [new Paragraph({ text: h, bold: true })],
              })
          ),
        }),
        ...rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph(String(cell))],
                  })
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
    <div className="relative inline-block group shrink-0">
      {/* Export Button */}
      <div >
        Export
        <FileDown size={18} />
      </div>

      {/* Dropdown */}
      <div className="absolute right-0 w-44 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
        <div
          onClick={() => handleExport("pdf")}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          PDF (.pdf)
        </div>
        <div
          onClick={() => handleExport("xlsx")}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          Excel (.xlsx)
        </div>
        <div
          onClick={() => handleExport("docx")}
          className="px-4 py-2 hover:bg-gray-100 rounded-b-lg cursor-pointer text-sm"
        >
          Word (.docx)
        </div>
      </div>
    </div>
  );
};

export default ExpenseExport;