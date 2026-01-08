import * as XLSX from "xlsx";
import { InvoiceHeader, InvoiceItem, AWBEntry } from "@/types/invoice";

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  }

  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  let result = "";
  if (billion) result += convertLessThanThousand(billion) + " Billion ";
  if (million) result += convertLessThanThousand(million) + " Million ";
  if (thousand) result += convertLessThanThousand(thousand) + " Thousand ";
  if (remainder) result += convertLessThanThousand(remainder);

  return result.trim() + " Only";
}

export function exportToExcel(
  header: InvoiceHeader,
  items: InvoiceItem[],
  filePrefix?: string,
  awbNo?: string
) {
  const wb = XLSX.utils.book_new();

  const currentAwbNo = awbNo || header.awbNo || "";

  // Group items by box and calculate totals per box
  const boxGroups = new Map<string, InvoiceItem[]>();
  items.forEach(item => {
    const boxId = item.boxId || "Box 1";
    if (!boxGroups.has(boxId)) {
      boxGroups.set(boxId, []);
    }
    boxGroups.get(boxId)!.push(item);
  });

  // Sort boxes by box number
  const sortedBoxes = Array.from(boxGroups.entries()).sort((a, b) => {
    const boxNoA = parseInt(a[0].replace("Box ", ""));
    const boxNoB = parseInt(b[0].replace("Box ", ""));
    return boxNoA - boxNoB;
  });

  // Calculate grand totals
  const grandTotals = {
    grossWt: 0,
    netWt: 0,
    quantity: 0,
  };

  sortedBoxes.forEach(([boxId, boxItems]) => {
    const boxGrossWt = boxItems.length > 0 ? (Number(boxItems[0].grossWt) || 0) : 0;
    const boxNetWt = boxItems.length > 0 ? (Number(boxItems[0].netWt) || 0) : 0;
    const boxQuantity = boxItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    
    grandTotals.grossWt += boxGrossWt;
    grandTotals.netWt += boxNetWt;
    grandTotals.quantity += boxQuantity;
  });

  // Create data array for the sheet (11 columns now with Box ID)
  const data: (string | number)[][] = [];

  // Header section
  data.push(["PACKING LIST", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Exporter section
  data.push([
    "Exporter:",
    "",
    "",
    "",
    "",
    "Invoice No.:",
    "",
    "Exporter Ref.",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "", "Invoice Date:", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "Buyer's Order No.:", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "Other Reference(s):", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Consignee section
  data.push([
    "Consignee:",
    "",
    "",
    "",
    "",
    "Buyer ( if other than consignee ):",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.companyName || "BBV LOGISTICS SUPPORT",
    "",
    "",
    "",
    "",
    "N/A",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.address || "INCHEONWEG 7",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    "1437 EK ROZENBURG",
    "",
    "",
    "",
    "",
    "Country of origin of goods:",
    "",
    "FINAL DEST:",
    "",
    "",
    "",
  ]);
  data.push([
    `EORI: ${header.eori || "EORI-NL822303474"}`,
    "",
    "",
    "",
    "",
    header.countryOfOrigin || "INDIA",
    "",
    header.finalDestination || "EUROPE (AMS)",
    "",
    "",
    "",
  ]);
  data.push([
    `Tel.: ${header.phone || "020-4068040"}, Email:- ${
      header.email || "csum@bbvlogistics.nl"
    }`,
    "",
    "",
    "",
    "",
    "Handling information if any:",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Shipping details
  data.push([
    "Pre-Carriage by",
    "",
    "Place of Receipt by pre-carrier",
    "",
    "Port of Discharge:",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "Port of Destination:", "", "", "", "", "", ""]);
  data.push([
    "Vessel / Flight No.",
    "",
    "Port of Loading:",
    "",
    "Final Destination:",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.vesselFlightNo || "NA",
    "",
    header.portOfLoading || "IGI DELHI",
    "",
    header.finalDestination || "EUROPE (AMS)",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // AWB Number section
  if (currentAwbNo) {
    data.push(["", "", "", "", "", "", "", "", "", "", ""]);
    data.push(["AWB No:", currentAwbNo, "", "", "", "", "", "", "", "", ""]);
    data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  }

  // Table headers (11 columns with Box ID)
  data.push([
    "S No.",
    "AWB No.",
    "Box ID",
    "GROSS WT.",
    "NET WT.",
    "Description of Goods",
    "DIMENSIONS",
    "",
    "",
    "HSN CODE",
    "Quantity",
  ]);
  data.push(["", "", "", "", "", "", "L", "B", "H", "", ""]);

  // Table data - grouped by boxes with Box ID and weights on ALL rows
  // For single AWB export, serial number is always 1
  sortedBoxes.forEach(([boxId, boxItems], boxIndex) => {
    // Sort items within the box
    const sortedItems = [...boxItems].sort((a, b) => (a.sNo || 0) - (b.sNo || 0));
    
    // Get box weights from first item
    const boxGrossWt = sortedItems.length > 0 ? (Number(sortedItems[0].grossWt) || 0) : 0;
    const boxNetWt = sortedItems.length > 0 ? (Number(sortedItems[0].netWt) || 0) : 0;

    sortedItems.forEach((item, itemIndex) => {
      // Show serial number and AWB No. only on very first item of first box
      const displaySerialNo = (boxIndex === 0 && itemIndex === 0) ? 1 : "";
      const displayAwb = (boxIndex === 0 && itemIndex === 0) ? (item.awbNo || currentAwbNo || "") : "";

      data.push([
        displaySerialNo,
        displayAwb,
        boxId, // Show box ID on every row
        boxGrossWt.toFixed(2), // Show gross weight on every row
        boxNetWt.toFixed(2), // Show net weight on every row
        item.description || "",
        item.dimensionL || 0,
        item.dimensionB || 0,
        item.dimensionH || 0,
        item.hsnCode || "",
        item.quantity || 0,
      ]);
    });
  });

  // Total row
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push([
    "TOTAL:",
    "",
    "",
    grandTotals.grossWt.toFixed(2),
    grandTotals.netWt.toFixed(2),
    "",
    "",
    "",
    "",
    "",
    grandTotals.quantity,
  ]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths (11 columns)
  ws["!cols"] = [
    { wch: 10 }, // S No.
    { wch: 12 }, // AWB No.
    { wch: 12 }, // Box ID
    { wch: 12 }, // GROSS WT.
    { wch: 12 }, // NET WT.
    { wch: 30 }, // Description
    { wch: 10 }, // L
    { wch: 10 }, // B
    { wch: 10 }, // H
    { wch: 15 }, // HSN CODE
    { wch: 12 }, // Quantity
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Packing List");

  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const prefix = filePrefix || "Packing_List";
  const awbSuffix = currentAwbNo ? `_${currentAwbNo}` : "";
  const filename = `${prefix}_${date}${awbSuffix}.xlsx`;

  // Save the file
  XLSX.writeFile(wb, filename);

  return filename;
}

// New function for Invoice Excel format (grouped by description, no AWB/Box ID column)
export function exportInvoiceExcel(
  header: InvoiceHeader,
  awbEntries: AWBEntry[],
  filePrefix?: string
) {
  const wb = XLSX.utils.book_new();

  // Extract all items from all AWB entries
  const allItems: InvoiceItem[] = [];
  awbEntries.forEach((awbEntry) => {
    awbEntry.items.forEach((item) => {
      allItems.push({
        ...item,
        awbNo: awbEntry.awbNo,
      });
    });
  });

  // Group items by description
  const groupedItems = new Map<string, InvoiceItem>();

  allItems.forEach((item) => {
    const key = item.description.toUpperCase().trim();
    if (groupedItems.has(key)) {
      const existing = groupedItems.get(key)!;
      existing.quantity += item.quantity;
    } else {
      groupedItems.set(key, {
        ...item,
        id: crypto.randomUUID(),
        sNo: 0,
        awbNo: "", // Clear AWB number for display
        boxId: "", // Clear Box ID for display
        quantity: item.quantity,
      });
    }
  });

  // Convert to array and sort
  const groupedArray = Array.from(groupedItems.values());
  const sortedItems = groupedArray.sort((a, b) =>
    a.description.localeCompare(b.description)
  );

  // Calculate grand total quantity
  const totalQuantity = sortedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Create data array for the sheet (4 columns)
  const data: (string | number)[][] = [];

  // Header section
  data.push(["INVOICE", "", "", ""]);
  data.push(["", "", "", ""]);
  data.push(["", "", "", ""]);
  data.push(["", "", "", ""]);

  // Exporter section
  data.push(["Exporter:", "", "Invoice No.:", ""]);
  data.push(["", "", "Invoice Date:", ""]);
  data.push(["", "", "Buyer's Order No.:", ""]);
  data.push(["", "", "", ""]);
  data.push(["", "", "Other Reference(s):", ""]);
  data.push(["", "", "", ""]);
  data.push(["", "", "", ""]);

  // Consignee section
  data.push(["Consignee:", "", "Buyer ( if other than consignee ):", ""]);
  data.push([
    header.companyName || "BBV LOGISTICS SUPPORT",
    "",
    "N/A",
    "",
  ]);
  data.push([header.address || "INCHEONWEG 7", "", "", ""]);
  data.push([
    "1437 EK ROZENBURG",
    "",
    "Country of origin of goods:",
    header.countryOfOrigin || "INDIA",
  ]);
  data.push([
    `EORI: ${header.eori || "EORI-NL822303474"}`,
    "",
    "FINAL DEST:",
    header.finalDestination || "EUROPE (AMS)",
  ]);
  data.push([
    `Tel.: ${header.phone || "020-4068040"}, Email:- ${
      header.email || "csum@bbvlogistics.nl"
    }`,
    "",
    "Handling information if any:",
    "",
  ]);

  // Shipping details
  data.push([
    "Pre-Carriage by",
    "Place of Receipt by pre-carrier",
    "Port of Discharge:",
    "",
  ]);
  data.push(["", "", "Port of Destination:", ""]);
  data.push([
    "Vessel / Flight No.",
    header.vesselFlightNo || "NA",
    "Port of Loading:",
    header.portOfLoading || "IGI DELHI",
  ]);
  data.push(["", "", "Final Destination:", header.finalDestination || "EUROPE (AMS)"]);
  data.push(["", "", "", ""]);
  data.push(["", "", "", ""]);

  // Table headers (S No., Description, HSN CODE, Quantity)
  data.push(["S No.", "Description of Goods", "HSN CODE", "Quantity"]);
  data.push(["", "", "", ""]);

  // Table data
  sortedItems.forEach((item, index) => {
    data.push([
      index + 1,
      item.description || "",
      item.hsnCode || "",
      item.quantity || 0,
    ]);
  });

  // Total row
  data.push(["", "", "", ""]);
  data.push(["TOTAL:", "", "", totalQuantity]);
  data.push(["", "", "", ""]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths (4 columns)
  ws["!cols"] = [
    { wch: 10 }, // S No.
    { wch: 40 }, // Description
    { wch: 15 }, // HSN CODE
    { wch: 12 }, // Quantity
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");

  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const prefix = filePrefix || "Invoice";
  const filename = `${prefix}_${date}.xlsx`;

  // Save the file
  XLSX.writeFile(wb, filename);

  return filename;
}

// Merged export with Box ID column - FIXED to show Box ID and weights on all rows
export function exportMergedExcel(
  header: InvoiceHeader,
  awbEntries: AWBEntry[],
  filePrefix?: string
) {
  const wb = XLSX.utils.book_new();

  // Sort AWB entries by AWB number
  const sortedEntries = [...awbEntries].sort((a, b) =>
    a.awbNo.localeCompare(b.awbNo)
  );

  // Create data array for the sheet (11 columns with Box ID)
  const data: (string | number)[][] = [];

  // Header section
  data.push(["PACKING LIST - MERGED", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Exporter section
  data.push([
    "Exporter:",
    "",
    "",
    "",
    "",
    "Invoice No.:",
    "",
    "Exporter Ref.",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "", "Invoice Date:", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "Buyer's Order No.:", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "Other Reference(s):", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Consignee section
  data.push([
    "Consignee:",
    "",
    "",
    "",
    "",
    "Buyer ( if other than consignee ):",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.companyName || "BBV LOGISTICS SUPPORT",
    "",
    "",
    "",
    "",
    "N/A",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.address || "INCHEONWEG 7",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    "1437 EK ROZENBURG",
    "",
    "",
    "",
    "",
    "Country of origin of goods:",
    "",
    "FINAL DEST:",
    "",
    "",
    "",
  ]);
  data.push([
    `EORI: ${header.eori || "EORI-NL822303474"}`,
    "",
    "",
    "",
    "",
    header.countryOfOrigin || "INDIA",
    "",
    header.finalDestination || "EUROPE (AMS)",
    "",
    "",
    "",
  ]);
  data.push([
    `Tel.: ${header.phone || "020-4068040"}, Email:- ${
      header.email || "csum@bbvlogistics.nl"
    }`,
    "",
    "",
    "",
    "",
    "Handling information if any:",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Shipping details
  data.push([
    "Pre-Carriage by",
    "",
    "Place of Receipt by pre-carrier",
    "",
    "Port of Discharge:",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "Port of Destination:", "", "", "", "", "", ""]);
  data.push([
    "Vessel / Flight No.",
    "",
    "Port of Loading:",
    "",
    "Final Destination:",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push([
    header.vesselFlightNo || "NA",
    "",
    header.portOfLoading || "IGI DELHI",
    "",
    header.finalDestination || "EUROPE (AMS)",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Table headers (11 columns with Box ID)
  data.push([
    "S No.",
    "AWB No.",
    "Box ID",
    "GROSS WT.",
    "NET WT.",
    "Description of Goods",
    "DIMENSIONS",
    "",
    "",
    "HSN CODE",
    "Quantity",
  ]);
  data.push(["", "", "", "", "", "", "L", "B", "H", "", ""]);

  // Calculate grand totals
  const grandTotals = {
    grossWt: 0,
    netWt: 0,
    quantity: 0,
  };

  let awbSerialNo = 1;

  // Add items grouped by AWB and then by Box with Box ID and weights on all rows
  sortedEntries.forEach((awbEntry, awbIndex) => {
    // Group items by box within this AWB
    const boxGroups = new Map<string, InvoiceItem[]>();
    awbEntry.items.forEach(item => {
      const boxId = item.boxId || "Box 1";
      if (!boxGroups.has(boxId)) {
        boxGroups.set(boxId, []);
      }
      boxGroups.get(boxId)!.push(item);
    });

    // Sort boxes by box number
    const sortedBoxes = Array.from(boxGroups.entries()).sort((a, b) => {
      const boxNoA = parseInt(a[0].replace("Box ", ""));
      const boxNoB = parseInt(b[0].replace("Box ", ""));
      return boxNoA - boxNoB;
    });

    // Add spacing before new AWB (except before first AWB)
    if (awbIndex > 0) {
      data.push(["", "", "", "", "", "", "", "", "", "", ""]);
    }

    // Process each box
    sortedBoxes.forEach(([boxId, boxItems], boxIndex) => {
      const sortedItems = [...boxItems].sort((a, b) => (a.sNo || 0) - (b.sNo || 0));
      
      // Get box weights from first item
      const boxGrossWt = sortedItems.length > 0 ? (Number(sortedItems[0].grossWt) || 0) : 0;
      const boxNetWt = sortedItems.length > 0 ? (Number(sortedItems[0].netWt) || 0) : 0;
      const boxQuantity = sortedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

      sortedItems.forEach((item, itemIndex) => {
        // Show Serial No. and AWB No. only on very first item of first box for each AWB
        const displaySerialNo = (boxIndex === 0 && itemIndex === 0) ? awbSerialNo : "";
        const displayAwb = (itemIndex === 0) ? awbEntry.awbNo : "";

        data.push([
          displaySerialNo,
          displayAwb,
          boxId, // Show box ID on every row
          boxGrossWt.toFixed(2), // Show gross weight on every row
          boxNetWt.toFixed(2), // Show net weight on every row
          item.description || "",
          item.dimensionL || 0,
          item.dimensionB || 0,
          item.dimensionH || 0,
          item.hsnCode || "",
          item.quantity || 0,
        ]);
      });

      // Add to grand totals (only once per box)
      grandTotals.grossWt += boxGrossWt;
      grandTotals.netWt += boxNetWt;
      grandTotals.quantity += boxQuantity;
    });
    
    // Increment AWB serial number for next AWB
    awbSerialNo++;
  });

  // Total row
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);
  data.push([
    "TOTAL:",
    "",
    "",
    grandTotals.grossWt.toFixed(2),
    grandTotals.netWt.toFixed(2),
    "",
    "",
    "",
    "",
    "",
    grandTotals.quantity,
  ]);
  data.push(["", "", "", "", "", "", "", "", "", "", ""]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths (11 columns)
  ws["!cols"] = [
    { wch: 10 }, // S No.
    { wch: 12 }, // AWB No.
    { wch: 12 }, // Box ID
    { wch: 12 }, // GROSS WT.
    { wch: 12 }, // NET WT.
    { wch: 30 }, // Description
    { wch: 10 }, // L
    { wch: 10 }, // B
    { wch: 10 }, // H
    { wch: 15 }, // HSN CODE
    { wch: 12 }, // Quantity
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Merged Packing List");

  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const prefix = filePrefix || "Merged_Packing_List";
  const filename = `${prefix}_${date}.xlsx`;

  // Save the file
  XLSX.writeFile(wb, filename);

  return filename;
}