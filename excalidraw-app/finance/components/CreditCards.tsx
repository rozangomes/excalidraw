import { useState } from "react";
import { useFinance } from "../store";
import { formatCurrency, getMonthTransactions } from "../utils";
import type { CreditCard } from "../types";
import { CardModal } from "./modals/CardModal";

export function CreditCards() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CreditCard | undefined>();

  const handleDelete = (id: string) => {
    if (window.confirm("Excluir este cartão?")) {
      dispatch({ type: "DELETE_CARD", payload: id });
    }
  };

  const getCardBalance = (cardId: string) => {
    return getMonthTransactions(state.transactions, state.currentMonth)
      .filter((t) => t.creditCardId === cardId && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
            Total em Faturas
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#EF4444" }}>
            {formatCurrency(state.creditCards.reduce((s, c) => s + getCardBalance(c.id), 0))}
          </div>
        </div>
        <button
          className="fin-btn fin-btn-primary"
          onClick={() => { setEditing(undefined); setShowModal(true); }}
        >
          + Novo Cartão
        </button>
      </div>

      {state.creditCards.length === 0 ? (
        <div className="fin-empty">
          <div className="fin-empty-icon">💳</div>
          <p>Nenhum cartão cadastrado.</p>
          <button className="fin-btn fin-btn-primary" onClick={() => setShowModal(true)}>
            Adicionar cartão
          </button>
        </div>
      ) : (
        <div className="fin-grid-2">
          {state.creditCards.map((card) => {
            const used = getCardBalance(card.id);
            const pct = Math.min((used / card.limit) * 100, 100);
            const available = card.limit - used;

            return (
              <div key={card.id}>
                {/* Visual card */}
                <div
                  className="fin-credit-card"
                  style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}CC)` }}
                >
                  <div>
                    <div className="fin-credit-card-name">{card.name}</div>
                    <div className="fin-credit-card-last4">···· ···· ···· {card.last4}</div>
                  </div>
                  <div className="fin-credit-card-bottom">
                    <div>
                      <div className="fin-credit-card-label">Fatura atual</div>
                      <div className="fin-credit-card-value">{formatCurrency(used)}</div>
                    </div>
                    <div>
                      <div className="fin-credit-card-label">Limite</div>
                      <div className="fin-credit-card-value">{formatCurrency(card.limit)}</div>
                    </div>
                    <div>
                      <div className="fin-credit-card-label">Vence dia</div>
                      <div className="fin-credit-card-value">{card.dueDay}</div>
                    </div>
                  </div>
                </div>

                {/* Details below card */}
                <div className="fin-card" style={{ marginTop: 12, borderRadius: "0 0 12px 12px", borderTop: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", marginBottom: 6 }}>
                    <span>Usado: {formatCurrency(used)}</span>
                    <span>Disponível: <strong style={{ color: "#10B981" }}>{formatCurrency(available)}</strong></span>
                  </div>
                  <div className="fin-progress">
                    <div
                      className="fin-progress-bar"
                      style={{
                        width: `${pct}%`,
                        background: pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#10B981",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                    <span>Fecha dia {card.closingDay}</span>
                    <span>{pct.toFixed(0)}% do limite</span>
                  </div>
                  <div className="fin-divider" />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="fin-btn fin-btn-ghost fin-btn-sm"
                      onClick={() => { setEditing(card); setShowModal(true); }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="fin-btn fin-btn-ghost fin-btn-sm"
                      onClick={() => handleDelete(card.id)}
                      style={{ color: "#EF4444" }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CardModal
          card={editing}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
