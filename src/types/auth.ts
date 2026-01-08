export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
}

export interface AuthState {
  user: User | null;
  runNumber: string | null;
  isAuthenticated: boolean;
}

export interface InvoiceSessionData {
  header: any;
  items: any[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
