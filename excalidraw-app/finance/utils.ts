import type { Account, Transaction } from "./types";

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export const currentMonthStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const prevMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const nextMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split("-").map(Number);
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const getMonthTransactions = (
  transactions: Transaction[],
  month: string,
) => transactions.filter((t) => t.date.startsWith(month));

// Current balance = initial balance +/- every *paid* transaction on the account.
// Pending (unpaid) transactions don't move money yet, so they are excluded.
export const getAccountBalance = (
  account: Account,
  transactions: Transaction[],
): number =>
  account.balance +
  transactions
    .filter((t) => t.accountId === account.id && t.paid)
    .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);

export const todayStr = (): string => new Date().toISOString().split("T")[0];
