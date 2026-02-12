import React from "react";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx";
import { saveAs } from "file-saver";


const ExportButton = ({ data, fileName = "ExportData" }) => {

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Sr.", "Main Content", "Subtext/Description", "Alignment", "Order", "Custom"];
    const rows = data.map((row, idx) => [
      idx + 1,
      row.primary || "",
      row.secondary || "",
      row.align || "",
      row.pos || "",
      row.isCustom ? "Yes" : "No",
    ]);

    // ✅ PDF (UNCHANGED STYLE)
    if (format === "pdf") {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const logoBase64 = "/newlogo.png"; // public folder image

      const header = () => {
        // Logo left
        doc.addImage(logoBase64, "WEBP", 6, 4, 40, 30);

        // Company name right
        doc.setFontSize(24);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("SubDuxion", pageWidth - 14, 21, { align: "right" });

      };

      const footer = (pageNumber, totalPages) => {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");

        // Bottom left: exact export timestamp
        const exportTime = new Date();
        const formattedTime = `${exportTime.getDate().toString().padStart(2, "0")}-${(exportTime.getMonth() + 1).toString().padStart(2, "0")}-${exportTime.getFullYear()} ${exportTime.getHours().toString().padStart(2, "0")}:${exportTime.getMinutes().toString().padStart(2, "0")}:${exportTime.getSeconds().toString().padStart(2, "0")}`;
        doc.text(`Exported on ${formattedTime}`, 9, pageHeight - 10);

        // Bottom right: page numbers
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
      };

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35, // table below header
        styles: { fontSize: 10, cellPadding: 3, font: "helvetica" },
        headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold", font: "helvetica" },
        didDrawPage: (data) => {
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const totalPages = doc.internal.getNumberOfPages();
          header();
          footer(pageNumber, totalPages);
        },
      });

      doc.save(`${fileName}.pdf`);
    }

    // ✅ Excel
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(
        data.map((row, idx) => ({
          Sr: idx + 1,
          "Main Content": row.primary || "",
          "Subtext/Description": row.secondary || "",
          Alignment: row.align || "",
          Order: row.pos || "",
          Custom: row.isCustom ? "Yes" : "No",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Home Sections");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    // ✅ Word
    if (format === "docx") {
      const tableRows = [
        new TableRow({
          children: headers.map((h) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: h, bold: true })],
            })
          ),
        }),
        ...rows.map((r) =>
          new TableRow({
            children: r.map((cell) =>
              new TableCell({ children: [new Paragraph(cell.toString())] })
            ),
          })
        ),
      ];

      const doc = new Document({
        sections: [{ children: [new Table({ rows: tableRows })] }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
    }
  };

  return (<><div className="relative inline-block group">
    {/* Blue button */}
    <div className="p-2 border-2 border-blue-600 hover:bg-blue-700   flex px-4 bg-blue-600 text-white rounded-lg cursor-pointer">
      Export <span className="pl-3 pt-0.5"><FileDown size={18} /></span>
    </div>

    {/* Dropdown on hover */}
    <div className="absolute left-0 w-44 bg-white border rounded-lg shadow-lg hidden group-hover:block z-50">
      <div
        onClick={() => handleExport("pdf")}
        className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
      >
        Pdf (.pdf)
      </div>
      <div
        onClick={() => handleExport("xlsx")}
        className="px-4 py-2 hover:bg-gray-100  cursor-pointer"
      >
        Excel (.xlsx)
      </div>
      <div
        onClick={() => handleExport("docx")}
        className="px-4 py-2 hover:bg-gray-100 rounded-b-lg cursor-pointer"
      >
        Word (.docx)
      </div>
    </div>
  </div>
  </>
  );
};

export default ExportButton;