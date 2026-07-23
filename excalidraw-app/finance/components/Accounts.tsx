import { useState } from "react";
import { useFinance } from "../store";
import { formatCurrency, getAccountBalance } from "../utils";
import type { Account } from "../types";
import { AccountModal } from "./modals/AccountModal";

const TYPE_ICONS: Record<string, string> = {
  checking: "🏦",
  savings: "🐷",
  wallet: "👛",
  investment: "📈",
};

const TYPE_LABELS: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  wallet: "Carteira",
  investment: "Investimentos",
};

export function Accounts() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>();

  const totalBalance = state.accounts
    .filter((a) => a.includeInTotal)
    .reduce((s, a) => s + getAccountBalance(a, state.transactions), 0);

  const handleDelete = (id: string) => {
    if (window.confirm("Excluir esta conta?")) {
      dispatch({ type: "DELETE_ACCOUNT", payload: id });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
            Saldo Total
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1E293B" }}>
            {formatCurrency(totalBalance)}
          </div>
        </div>
        <button
          className="fin-btn fin-btn-primary"
          onClick={() => { setEditing(undefined); setShowModal(true); }}
        >
          + Nova Conta
        </button>
      </div>

      <div className="fin-grid-2">
        {state.accounts.length === 0 ? (
          <div className="fin-empty">
            <div className="fin-empty-icon">🏦</div>
            <p>Nenhuma conta cadastrada ainda.</p>
            <button className="fin-btn fin-btn-primary" onClick={() => setShowModal(true)}>
              Adicionar primeira conta
            </button>
          </div>
        ) : (
          state.accounts.map((acc) => {
            const balance = getAccountBalance(acc, state.transactions);
            return (
            <div key={acc.id} className="fin-account-card">
              <div
                className="fin-account-icon"
                style={{ background: `${acc.color}22` }}
              >
                {TYPE_ICONS[acc.type]}
              </div>
              <div className="fin-account-info">
                <div className="fin-account-name">{acc.name}</div>
                <div className="fin-account-type">{TYPE_LABELS[acc.type]}</div>
                {!acc.includeInTotal && (
                  <span className="fin-badge fin-badge-yellow" style={{ marginTop: 4 }}>
                    Fora do total
                  </span>
                )}
              </div>
              <div>
                <div className="fin-account-balance" style={{ color: balance >= 0 ? "#1E293B" : "#EF4444" }}>
                  {formatCurrency(balance)}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  <button
                    className="fin-btn fin-btn-ghost fin-btn-sm"
                    onClick={() => { setEditing(acc); setShowModal(true); }}
                  >
                    ✏️
                  </button>
                  <button
                    className="fin-btn fin-btn-ghost fin-btn-sm"
                    onClick={() => handleDelete(acc.id)}
                    style={{ color: "#EF4444" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {showModal && (
        <AccountModal
          account={editing}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
