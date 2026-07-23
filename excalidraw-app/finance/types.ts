export type AccountType = "checking" | "savings" | "wallet" | "investment";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Initial balance at registration; current balance is derived from paid transactions. */
  balance: number;
  color: string;
  includeInTotal: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  last4: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  currentBalance: number;
}

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
  monthlyLimit?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId?: string;
  creditCardId?: string;
  paid: boolean;
  notes?: string;
  installments?: number;
  installmentNumber?: number;
}

export type View =
  | "dashboard"
  | "accounts"
  | "credit-cards"
  | "transactions"
  | "categories"
  | "reports";

export interface AppState {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  currentView: View;
  currentMonth: string;
}

export type Action =
  | { type: "SET_VIEW"; payload: View }
  | { type: "SET_MONTH"; payload: string }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: string }
  | { type: "ADD_CARD"; payload: CreditCard }
  | { type: "UPDATE_CARD"; payload: CreditCard }
  | { type: "DELETE_CARD"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "TOGGLE_PAID"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "RESTORE_STATE"; payload: AppState };
