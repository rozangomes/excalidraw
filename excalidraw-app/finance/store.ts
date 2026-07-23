import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type Dispatch,
} from "react";
import type { AppState, Action, Account, CreditCard, Transaction, Category } from "./types";
import { currentMonthStr, generateId } from "./utils";

const STORAGE_KEY = "organizze-finance-data";

const defaultCategories: Category[] = [
  { id: "cat-1", name: "Salário", icon: "💰", color: "#10B981", type: "income" },
  { id: "cat-2", name: "Freelance", icon: "💻", color: "#6366F1", type: "income" },
  { id: "cat-3", name: "Investimentos", icon: "📈", color: "#F59E0B", type: "income" },
  { id: "cat-4", name: "Alimentação", icon: "🍽️", color: "#EF4444", type: "expense", monthlyLimit: 1200_00 },
  { id: "cat-5", name: "Moradia", icon: "🏠", color: "#8B5CF6", type: "expense", monthlyLimit: 2500_00 },
  { id: "cat-6", name: "Transporte", icon: "🚗", color: "#F97316", type: "expense", monthlyLimit: 600_00 },
  { id: "cat-7", name: "Saúde", icon: "💊", color: "#EC4899", type: "expense", monthlyLimit: 500_00 },
  { id: "cat-8", name: "Lazer", icon: "🎮", color: "#14B8A6", type: "expense", monthlyLimit: 400_00 },
  { id: "cat-9", name: "Educação", icon: "📚", color: "#3B82F6", type: "expense", monthlyLimit: 300_00 },
  { id: "cat-10", name: "Vestuário", icon: "👕", color: "#A78BFA", type: "expense", monthlyLimit: 300_00 },
  { id: "cat-11", name: "Assinaturas", icon: "📱", color: "#06B6D4", type: "expense", monthlyLimit: 200_00 },
  { id: "cat-12", name: "Outros", icon: "📦", color: "#6B7280", type: "both" },
];

const seedAccounts: Account[] = [
  { id: "acc-1", name: "Nubank", type: "checking", balance: 4250_75, color: "#820AD1", includeInTotal: true },
  { id: "acc-2", name: "Itaú", type: "checking", balance: 1830_40, color: "#EC7000", includeInTotal: true },
  { id: "acc-3", name: "Poupança", type: "savings", balance: 12500_00, color: "#10B981", includeInTotal: true },
  { id: "acc-4", name: "Carteira", type: "wallet", balance: 200_00, color: "#F59E0B", includeInTotal: true },
];

const seedCards: CreditCard[] = [
  { id: "card-1", name: "Nubank", last4: "1234", limit: 5000_00, closingDay: 19, dueDay: 26, color: "#820AD1", currentBalance: 1456_90 },
  { id: "card-2", name: "Itaú Platinum", last4: "5678", limit: 8000_00, closingDay: 10, dueDay: 17, color: "#EC7000", currentBalance: 2340_00 },
];

const today = new Date();
const m = String(today.getMonth() + 1).padStart(2, "0");
const y = today.getFullYear();
const pm = String(today.getMonth()).padStart(2, "0") || "12";
const py = today.getMonth() === 0 ? y - 1 : y;

const seedTransactions: Transaction[] = [
  { id: generateId(), type: "income", description: "Salário", amount: 6500_00, date: `${y}-${m}-05`, categoryId: "cat-1", accountId: "acc-1", paid: true },
  { id: generateId(), type: "income", description: "Freela - Site Institucional", amount: 1200_00, date: `${y}-${m}-12`, categoryId: "cat-2", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Aluguel", amount: 1800_00, date: `${y}-${m}-10`, categoryId: "cat-5", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Supermercado", amount: 450_00, date: `${y}-${m}-08`, categoryId: "cat-4", accountId: "acc-2", paid: true },
  { id: generateId(), type: "expense", description: "iFood", amount: 89_90, date: `${y}-${m}-11`, categoryId: "cat-4", creditCardId: "card-1", paid: true },
  { id: generateId(), type: "expense", description: "Netflix", amount: 45_90, date: `${y}-${m}-15`, categoryId: "cat-11", creditCardId: "card-1", paid: true },
  { id: generateId(), type: "expense", description: "Spotify", amount: 21_90, date: `${y}-${m}-15`, categoryId: "cat-11", creditCardId: "card-1", paid: true },
  { id: generateId(), type: "expense", description: "Combustível", amount: 220_00, date: `${y}-${m}-07`, categoryId: "cat-6", accountId: "acc-2", paid: true },
  { id: generateId(), type: "expense", description: "Academia", amount: 99_90, date: `${y}-${m}-01`, categoryId: "cat-7", creditCardId: "card-2", paid: true },
  { id: generateId(), type: "expense", description: "Consulta médica", amount: 180_00, date: `${y}-${m}-14`, categoryId: "cat-7", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Curso Udemy", amount: 39_90, date: `${y}-${m}-03`, categoryId: "cat-9", creditCardId: "card-1", paid: true },
  { id: generateId(), type: "expense", description: "Cinema", amount: 60_00, date: `${y}-${m}-16`, categoryId: "cat-8", accountId: "acc-4", paid: true },
  { id: generateId(), type: "expense", description: "Jantar aniversário", amount: 145_00, date: `${y}-${m}-18`, categoryId: "cat-8", creditCardId: "card-1", paid: false },
  { id: generateId(), type: "expense", description: "Conta de luz", amount: 185_00, date: `${y}-${m}-20`, categoryId: "cat-5", accountId: "acc-1", paid: false },
  { id: generateId(), type: "expense", description: "Internet", amount: 99_90, date: `${y}-${m}-22`, categoryId: "cat-5", accountId: "acc-1", paid: false },
  // Previous month
  { id: generateId(), type: "income", description: "Salário", amount: 6500_00, date: `${py}-${pm}-05`, categoryId: "cat-1", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Aluguel", amount: 1800_00, date: `${py}-${pm}-10`, categoryId: "cat-5", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Supermercado", amount: 520_00, date: `${py}-${pm}-08`, categoryId: "cat-4", accountId: "acc-2", paid: true },
  { id: generateId(), type: "expense", description: "Combustível", amount: 195_00, date: `${py}-${pm}-07`, categoryId: "cat-6", accountId: "acc-2", paid: true },
  { id: generateId(), type: "expense", description: "Netflix", amount: 45_90, date: `${py}-${pm}-15`, categoryId: "cat-11", creditCardId: "card-1", paid: true },
  { id: generateId(), type: "income", description: "Freela - App Mobile", amount: 2500_00, date: `${py}-${pm}-20`, categoryId: "cat-2", accountId: "acc-1", paid: true },
  { id: generateId(), type: "expense", description: "Restaurante", amount: 200_00, date: `${py}-${pm}-25`, categoryId: "cat-4", creditCardId: "card-1", paid: true },
];

const createInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    accounts: seedAccounts,
    creditCards: seedCards,
    transactions: seedTransactions,
    categories: defaultCategories,
    currentView: "dashboard",
    currentMonth: currentMonthStr(),
  };
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    case "SET_MONTH":
      return { ...state, currentMonth: action.payload };
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };
    case "UPDATE_ACCOUNT":
      return { ...state, accounts: state.accounts.map((a) => a.id === action.payload.id ? action.payload : a) };
    case "DELETE_ACCOUNT":
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.payload) };
    case "ADD_CARD":
      return { ...state, creditCards: [...state.creditCards, action.payload] };
    case "UPDATE_CARD":
      return { ...state, creditCards: state.creditCards.map((c) => c.id === action.payload.id ? action.payload : c) };
    case "DELETE_CARD":
      return { ...state, creditCards: state.creditCards.filter((c) => c.id !== action.payload) };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return { ...state, transactions: state.transactions.map((t) => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case "TOGGLE_PAID":
      return { ...state, transactions: state.transactions.map((t) => t.id === action.payload ? { ...t, paid: !t.paid } : t) };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "UPDATE_CATEGORY":
      return { ...state, categories: state.categories.map((c) => c.id === action.payload.id ? action.payload : c) };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    default:
      return state;
  }
}

import { createElement, type ReactNode } from "react";

interface ContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const FinanceContext = createContext<ContextValue>({} as ContextValue);

export const useFinance = () => useContext(FinanceContext);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return createElement(FinanceContext.Provider, { value: { state, dispatch } }, children);
}
