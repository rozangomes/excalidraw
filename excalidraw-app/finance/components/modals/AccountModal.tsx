import { useState } from "react";
import { useFinance } from "../../store";
import { generateId } from "../../utils";
import type { Account, AccountType } from "../../types";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#820AD1", "#EC7000", "#F97316"];

interface Props {
  account?: Account;
  onClose: () => void;
}

export function AccountModal({ account, onClose }: Props) {
  const { dispatch } = useFinance();
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "checking");
  const [balance, setBalance] = useState(account?.balance?.toString() ?? "0");
  const [color, setColor] = useState(account?.color ?? COLORS[0]);
  const [includeInTotal, setIncludeInTotal] = useState(account?.includeInTotal ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const acc: Account = {
      id: account?.id ?? generateId(),
      name,
      type,
      balance: parseFloat(balance) || 0,
      color,
      includeInTotal,
    };

    if (account) {
      dispatch({ type: "UPDATE_ACCOUNT", payload: acc });
    } else {
      dispatch({ type: "ADD_ACCOUNT", payload: acc });
    }
    onClose();
  };

  const typeLabels: Record<AccountType, string> = {
    checking: "Conta Corrente",
    savings: "Poupança",
    wallet: "Carteira",
    investment: "Investimentos",
  };

  return (
    <div className="fin-modal-backdrop" onClick={onClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{account ? "Editar Conta" : "Nova Conta"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="fin-form-group">
            <label>Nome</label>
            <input
              className="fin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Carteira..."
              required
            />
          </div>

          <div className="fin-form-row">
            <div className="fin-form-group">
              <label>Tipo</label>
              <select
                className="fin-input"
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
              >
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="fin-form-group">
              <label>Saldo Inicial (R$)</label>
              <input
                className="fin-input"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
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

          <div className="fin-form-group">
            <label>
              <input
                type="checkbox"
                checked={includeInTotal}
                onChange={(e) => setIncludeInTotal(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Incluir no saldo total
            </label>
          </div>

          <div className="fin-form-actions">
            <button type="button" className="fin-btn fin-btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="fin-btn fin-btn-primary">
              {account ? "Salvar" : "Criar Conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
