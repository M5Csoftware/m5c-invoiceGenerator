// src/types/invoice.ts

export interface InvoiceItem {
  id: string;
  sNo: number;
  grossWt: number;
  netWt: number;
  description: string;
  dimensionL: number;
  dimensionB: number;
  dimensionH: number;
  hsnCode: string;
  quantity: number;
  awbNo?: string; // Optional - for displaying AWB in item rows
  boxId?: string; // Optional - Box ID for each item
}

export interface InvoiceHeader {
  companyName: string;
  address: string;
  eori: string;
  phone: string;
  email: string;
  countryOfOrigin: string;
  finalDestination: string;
  preCarriageBy: string;
  placeOfReceipt: string;
  portOfDischarge: string;
  portOfDestination: string;
  vesselFlightNo: string;
  portOfLoading: string;
  awbNo?: string; // Optional - for current AWB context
}

// AWB-based invoice entry
export interface AWBEntry {
  awbNo: string;
  items: InvoiceItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Session data with multiple AWB entries
export interface RunSessionData {
  runNumber: string;
  header: InvoiceHeader;
  awbEntries: AWBEntry[];
  lastUpdatedAt: string;
}