import { useState } from "react";
import { useFinance } from "../store";
import { formatCurrency, formatDate, getMonthTransactions, prevMonth, nextMonth, formatMonth } from "../utils";
import type { Transaction } from "../types";
import { TransactionModal } from "./modals/TransactionModal";

export function Transactions() {
  const { state, dispatch } = useFinance();
  const { transactions, categories, accounts, creditCards, currentMonth } = state;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");

  const monthTxs = getMonthTransactions(transactions, currentMonth);

  const filtered = monthTxs
    .filter((t) => filterType === "all" || t.type === filterType)
    .filter((t) => !filterCat || t.categoryId === filterCat)
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleDelete = (id: string) => {
    if (window.confirm("Excluir esta transação?")) {
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    }
  };

  const getPaymentLabel = (tx: Transaction) => {
    if (tx.creditCardId) {
      const card = creditCards.find((c) => c.id === tx.creditCardId);
      return `💳 ${card?.name ?? "Cartão"}`;
    }
    if (tx.accountId) {
      const acc = accounts.find((a) => a.id === tx.accountId);
      return `🏦 ${acc?.name ?? "Conta"}`;
    }
    return "";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div className="fin-month-nav">
          <button onClick={() => dispatch({ type: "SET_MONTH", payload: prevMonth(currentMonth) })}>‹</button>
          <span>{formatMonth(currentMonth)}</span>
          <button onClick={() => dispatch({ type: "SET_MONTH", payload: nextMonth(currentMonth) })}>›</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="fin-btn fin-btn-success"
            onClick={() => { setEditing(undefined); setShowModal(true); }}
          >
            + Nova Transação
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="fin-card" style={{ flex: 1, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>RECEITAS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>{formatCurrency(totalIncome)}</div>
        </div>
        <div className="fin-card" style={{ flex: 1, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>DESPESAS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#EF4444" }}>{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="fin-card" style={{ flex: 1, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>SALDO DO MÊS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: totalIncome - totalExpenses >= 0 ? "#10B981" : "#EF4444" }}>
            {formatCurrency(totalIncome - totalExpenses)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fin-filter-bar">
        <input
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)}>
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="fin-empty">
          <div className="fin-empty-icon">📭</div>
          <p>Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div>
          {filtered.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            return (
              <div key={tx.id} className="fin-tx-item" style={{ marginBottom: 6 }}>
                <div
                  className="fin-tx-icon"
                  style={{ background: cat ? `${cat.color}22` : "#F1F5F9" }}
                >
                  {cat?.icon ?? "📦"}
                </div>
                <div className="fin-tx-info">
                  <div className="fin-tx-desc">{tx.description}</div>
                  <div className="fin-tx-meta">
                    {formatDate(tx.date)} · {cat?.name ?? "–"} · {getPaymentLabel(tx)}
                    {tx.installments && ` · Parcela ${tx.installmentNumber}/${tx.installments}`}
                  </div>
                </div>
                <div className={`fin-tx-amount ${tx.type}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </div>
                <div
                  className={`fin-tx-status ${tx.paid ? "paid" : "unpaid"}`}
                  title={tx.paid ? "Pago/Recebido" : "Pendente"}
                  style={{ cursor: "pointer" }}
                  onClick={() => dispatch({ type: "TOGGLE_PAID", payload: tx.id })}
                />
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="fin-btn fin-btn-ghost fin-btn-sm"
                    onClick={() => { setEditing(tx); setShowModal(true); }}
                  >
                    ✏️
                  </button>
                  <button
                    className="fin-btn fin-btn-ghost fin-btn-sm"
                    onClick={() => handleDelete(tx.id)}
                    style={{ color: "#EF4444" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TransactionModal
          transaction={editing}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
