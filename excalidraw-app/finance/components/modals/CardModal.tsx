import { useState } from "react";
import { useFinance } from "../../store";
import { generateId, parseAmountInput, centsToInputValue } from "../../utils";
import type { CreditCard } from "../../types";

const COLORS = ["#820AD1", "#EC7000", "#1E293B", "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#EC4899"];

interface Props {
  card?: CreditCard;
  onClose: () => void;
}

export function CardModal({ card, onClose }: Props) {
  const { dispatch } = useFinance();
  const [name, setName] = useState(card?.name ?? "");
  const [last4, setLast4] = useState(card?.last4 ?? "");
  const [limit, setLimit] = useState(
    card ? centsToInputValue(card.limit) : "",
  );
  const [closingDay, setClosingDay] = useState(card?.closingDay?.toString() ?? "");
  const [dueDay, setDueDay] = useState(card?.dueDay?.toString() ?? "");
  const [color, setColor] = useState(card?.color ?? COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit || !closingDay || !dueDay) return;

    const c: CreditCard = {
      id: card?.id ?? generateId(),
      name,
      last4: last4 || "0000",
      limit: parseAmountInput(limit),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      color,
      currentBalance: card?.currentBalance ?? 0,
    };

    if (card) {
      dispatch({ type: "UPDATE_CARD", payload: c });
    } else {
      dispatch({ type: "ADD_CARD", payload: c });
    }
    onClose();
  };

  return (
    <div className="fin-modal-backdrop" onClick={onClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{card ? "Editar Cartão" : "Novo Cartão de Crédito"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="fin-form-group">
            <label>Nome do Cartão</label>
            <input
              className="fin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank, Itaú Platinum..."
              required
            />
          </div>

          <div className="fin-form-row">
            <div className="fin-form-group">
              <label>Últimos 4 dígitos</label>
              <input
                className="fin-input"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div className="fin-form-group">
              <label>Limite (R$)</label>
              <input
                className="fin-input"
                type="number"
                step="0.01"
                min="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="5.000,00"
                required
              />
            </div>
          </div>

          <div className="fin-form-row">
            <div className="fin-form-group">
              <label>Dia de fechamento</label>
              <input
                className="fin-input"
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                placeholder="Ex: 19"
                required
              />
            </div>
            <div className="fin-form-group">
              <label>Dia de vencimento</label>
              <input
                className="fin-input"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="Ex: 26"
                required
              />
            </div>
          </div>

          <div className="fin-form-group">
            <label>Cor</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    border: color === c ? "3px solid #1E293B" : "3px solid transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="fin-form-actions">
            <button type="button" className="fin-btn fin-btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="fin-btn fin-btn-primary">
              {card ? "Salvar" : "Adicionar Cartão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
