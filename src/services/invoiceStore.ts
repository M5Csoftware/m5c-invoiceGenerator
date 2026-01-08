import { InvoiceHeader, InvoiceItem } from '@/types/invoice';
import { InvoiceSessionData } from '@/types/auth';

const STORAGE_PREFIX = 'invoice_session_';

export const getSessionKey = (runNumber: string) => `${STORAGE_PREFIX}${runNumber}`;

export const getInvoiceData = (runNumber: string): InvoiceSessionData | null => {
  try {
    const data = localStorage.getItem(getSessionKey(runNumber));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading invoice data", error);
    return null;
  }
};

export const saveInvoiceData = (
  runNumber: string, 
  header: InvoiceHeader, 
  items: InvoiceItem[], 
  username: string
) => {
  try {
    const data: InvoiceSessionData = {
      header,
      items,
      lastUpdatedBy: username,
      lastUpdatedAt: new Date().toISOString()
    };
    localStorage.setItem(getSessionKey(runNumber), JSON.stringify(data));
    // Dispatch event for same-window updates if needed
    window.dispatchEvent(new Event('invoice-storage-update'));
  } catch (error) {
    console.error("Error saving invoice data", error);
  }
};
