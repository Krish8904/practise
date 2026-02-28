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

const CompanyExport = ({ data, fileName = "CompanyInquiries" }) => {
  const headers = [
    "Sr.",
    "Company",
    "Website",
    "Nature of Business",
    "Channel",
    "Company Email",
    "Category",
    "Subcategory",
    "Company Mobile",
    "Contact Person",
    "Personal Email",
    "Gender",
    "Personal Mobile",
  ];

  const rows = data.map((c, index) => [
    index + 1,
    c.companyName || "",
    c.website || "",
    c.natureOfBusiness?.join(", ") || "",
    c.channel?.join(", ") || "",
    c.companyEmail || "",
    c.category || "",
    c.subcategory?.join(", ") || "",
    `${c.countryCode || ""} ${c.companyMobile || ""}`,
    [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" "),
    c.personalEmail || "",
    c.gender || "",
    `${c.personalCountryCode || ""} ${c.personalMobile || ""}`,
  ]);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    // ✅ PDF
    if (format === "pdf") {
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const logoBase64 = "/newlogo.png";

      const header = () => {
        // Logo 
        doc.addImage(logoBase64, "WEBP", 10, 0, 44, 34);

        // Company name 
        doc.setFontSize(27);
        doc.setFont("helvetica", "bold");
        doc.text("SubDuxion", pageWidth - 14, 20, { align: "right" });
      };

      const footer = (pageNumber, totalPages) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        const exportTime = new Date();
        const formattedTime = `${exportTime
          .getDate()
          .toString()
          .padStart(2, "0")}-${(exportTime.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${exportTime.getFullYear()} ${exportTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${exportTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${exportTime
                  .getSeconds()
                  .toString()
                  .padStart(2, "0")}`;

        // Bottom left
        doc.text(`Exported on ${formattedTime}`, 10, pageHeight - 10);

        // Bottom right
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
        startY: 35, // leave space for header
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 0,
          fontStyle: "bold",
        },
        didDrawPage: (data) => {
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const totalPages = doc.internal.getNumberOfPages();
          header();
          footer(pageNumber, totalPages);
        },
      });

      doc.save(`${fileName}.pdf`);
    }

    if (format === "xlsx") {
      const worksheetData = [
        headers,
        ...rows
      ];

      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Company Inquiries");

      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    //  Word
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
        ...rows.map((row) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({
                children: [new Paragraph(cell.toString())],
              })
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

  return (
    <div className="relative inline-block group shrink-0">
      {/* Blue Export Button */}
      <div className="inline-flex items-center gap-2 px-4 mr-1.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg border border-blue-600 hover:bg-white hover:text-blue-600 transition-all shrink-0 whitespace-nowrap cursor-pointer">
        Export
        <FileDown size={18} />
      </div>

      {/* Dropdown */}
      <div className="absolute right-0 w-44 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
        <div
          onClick={() => handleExport("pdf")}
          className="px-4 py-2 hover:bg-gray-100  cursor-pointer"
        >
          PDF (.pdf)
        </div>
        <div
          onClick={() => handleExport("xlsx")}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
  );
};

export default CompanyExport;