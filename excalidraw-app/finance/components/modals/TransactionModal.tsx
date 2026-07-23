import { useState } from "react";
import { useFinance } from "../../store";
import { generateId, todayStr, parseAmountInput, centsToInputValue } from "../../utils";
import type { Transaction, TransactionType } from "../../types";

interface Props {
  transaction?: Transaction;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function TransactionModal({ transaction, onClose, defaultType = "expense" }: Props) {
  const { state, dispatch } = useFinance();
  const { categories, accounts, creditCards } = state;

  const [type, setType] = useState<TransactionType>(transaction?.type ?? defaultType);
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(
    transaction ? centsToInputValue(transaction.amount) : "",
  );
  const [date, setDate] = useState(transaction?.date ?? todayStr());
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [accountId, setAccountId] = useState(transaction?.accountId ?? "");
  const [creditCardId, setCreditCardId] = useState(transaction?.creditCardId ?? "");
  const [paid, setPaid] = useState(transaction?.paid ?? true);
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [useCard, setUseCard] = useState(!!transaction?.creditCardId);

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId || (!useCard && !accountId) || (useCard && !creditCardId)) return;

    const tx: Transaction = {
      id: transaction?.id ?? generateId(),
      type,
      description,
      amount: parseAmountInput(amount),
      date,
      categoryId,
      accountId: useCard ? undefined : accountId,
      creditCardId: useCard ? creditCardId : undefined,
      paid,
      notes: notes || undefined,
    };

    if (transaction) {
      dispatch({ type: "UPDATE_TRANSACTION", payload: tx });
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload: tx });
    }
    onClose();
  };

  return (
    <div className="fin-modal-backdrop" onClick={onClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{transaction ? "Editar Transação" : "Nova Transação"}</h3>

        {/* Type switcher */}
        <div className="fin-type-switcher" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`fin-type-btn${type === "income" ? " active-income" : ""}`}
            onClick={() => setType("income")}
          >
            ⬆️ Receita
          </button>
          <button
            type="button"
            className={`fin-type-btn${type === "expense" ? " active-expense" : ""}`}
            onClick={() => setType("expense")}
          >
            ⬇️ Despesa
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fin-form-group">
            <label>Descrição</label>
            <input
              className="fin-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              required
            />
          </div>

          <div className="fin-form-row">
            <div className="fin-form-group">
              <label>Valor (R$)</label>
              <input
                className="fin-input"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="fin-form-group">
              <label>Data</label>
              <input
                className="fin-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="fin-form-group">
            <label>Categoria</label>
            <select
              className="fin-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {type === "expense" && (
            <div className="fin-form-group">
              <label>Pagar com</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  className={`fin-btn fin-btn-sm ${!useCard ? "fin-btn-primary" : "fin-btn-ghost"}`}
                  onClick={() => setUseCard(false)}
                >
                  🏦 Conta
                </button>
                <button
                  type="button"
                  className={`fin-btn fin-btn-sm ${useCard ? "fin-btn-primary" : "fin-btn-ghost"}`}
                  onClick={() => setUseCard(true)}
                >
                  💳 Cartão
                </button>
              </div>
              {useCard ? (
                <select
                  className="fin-input"
                  value={creditCardId}
                  onChange={(e) => setCreditCardId(e.target.value)}
                  required
                >
                  <option value="">Selecione o cartão...</option>
                  {creditCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ····{c.last4}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="fin-input"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                >
                  <option value="">Selecione a conta...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {type === "income" && (
            <div className="fin-form-group">
              <label>Conta de destino</label>
              <select
                className="fin-input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Selecione a conta...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="fin-form-group">
            <label>
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              {type === "income" ? "Recebido" : "Pago"}
            </label>
          </div>

          <div className="fin-form-group">
            <label>Observações (opcional)</label>
            <input
              className="fin-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas..."
            />
          </div>

          <div className="fin-form-actions">
            <button type="button" className="fin-btn fin-btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`fin-btn ${type === "income" ? "fin-btn-success" : "fin-btn-danger"}`}>
              {transaction ? "Salvar" : type === "income" ? "Adicionar Receita" : "Adicionar Despesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
