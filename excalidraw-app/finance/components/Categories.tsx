import { useState } from "react";
import { useFinance } from "../store";
import { formatCurrency, getMonthTransactions, generateId, parseAmountInput, centsToInputValue } from "../utils";
import type { Category } from "../types";

const COLORS = ["#10B981", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#3B82F6", "#A78BFA", "#14B8A6", "#6B7280"];
const ICONS = ["💰", "💻", "📈", "🍽️", "🏠", "🚗", "💊", "🎮", "📚", "👕", "📱", "📦", "✈️", "🎵", "🏋️", "🐾", "🎓", "🛒"];

function CategoryModal({ category, onClose }: { category?: Category; onClose: () => void }) {
  const { dispatch } = useFinance();
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? ICONS[0]);
  const [color, setColor] = useState(category?.color ?? COLORS[0]);
  const [type, setType] = useState<Category["type"]>(category?.type ?? "expense");
  const [monthlyLimit, setMonthlyLimit] = useState(
    category?.monthlyLimit ? centsToInputValue(category.monthlyLimit) : "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const cat: Category = {
      id: category?.id ?? generateId(),
      name,
      icon,
      color,
      type,
      monthlyLimit: monthlyLimit ? parseAmountInput(monthlyLimit) : undefined,
    };
    if (category) {
      dispatch({ type: "UPDATE_CATEGORY", payload: cat });
    } else {
      dispatch({ type: "ADD_CATEGORY", payload: cat });
    }
    onClose();
  };

  return (
    <div className="fin-modal-backdrop" onClick={onClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{category ? "Editar Categoria" : "Nova Categoria"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="fin-form-row">
            <div className="fin-form-group">
              <label>Nome</label>
              <input className="fin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" required />
            </div>
            <div className="fin-form-group">
              <label>Tipo</label>
              <select className="fin-input" value={type} onChange={(e) => setType(e.target.value as Category["type"])}>
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
                <option value="both">Ambos</option>
              </select>
            </div>
          </div>
          <div className="fin-form-group">
            <label>Ícone</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ICONS.map((i) => (
                <button
                  key={i} type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    width: 36, height: 36, border: icon === i ? "2px solid #3B82F6" : "2px solid #E2E8F0",
                    borderRadius: 8, cursor: "pointer", background: icon === i ? "#EFF6FF" : "#fff",
                    fontSize: 18,
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="fin-form-group">
            <label>Cor</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map((c) => (
                <div
                  key={c} onClick={() => setColor(c)}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "3px solid #1E293B" : "3px solid transparent" }}
                />
              ))}
            </div>
          </div>
          {(type === "expense" || type === "both") && (
            <div className="fin-form-group">
              <label>Limite mensal (R$) — opcional</label>
              <input className="fin-input" type="number" step="0.01" min="0" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} placeholder="Ex: 500,00" />
            </div>
          )}
          <div className="fin-form-actions">
            <button type="button" className="fin-btn fin-btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="fin-btn fin-btn-primary">{category ? "Salvar" : "Criar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Categories() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();

  const monthTxs = getMonthTransactions(state.transactions, state.currentMonth);

  const getSpent = (catId: string) =>
    monthTxs.filter((t) => t.categoryId === catId && t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleDelete = (id: string) => {
    if (window.confirm("Excluir esta categoria?")) {
      dispatch({ type: "DELETE_CATEGORY", payload: id });
    }
  };

  const expenseCategories = state.categories.filter((c) => c.type !== "income");
  const incomeCategories = state.categories.filter((c) => c.type !== "expense");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="fin-btn fin-btn-primary" onClick={() => { setEditing(undefined); setShowModal(true); }}>
          + Nova Categoria
        </button>
      </div>

      <div className="fin-grid-2">
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>
            ⬇️ Despesas
          </div>
          {expenseCategories.map((cat) => {
            const spent = getSpent(cat.id);
            const limit = cat.monthlyLimit;
            const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;

            return (
              <div key={cat.id} className="fin-category-item">
                <div className="fin-category-icon" style={{ background: `${cat.color}22` }}>{cat.icon}</div>
                <div className="fin-category-info">
                  <div className="fin-category-name">{cat.name}</div>
                  {limit ? (
                    <>
                      <div className="fin-category-limit">
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </div>
                      <div className="fin-progress" style={{ height: 5, marginTop: 4 }}>
                        <div
                          className="fin-progress-bar"
                          style={{ width: `${pct}%`, background: pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : cat.color }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="fin-category-limit">{formatCurrency(spent)} gasto</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={() => { setEditing(cat); setShowModal(true); }}>✏️</button>
                  <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={() => handleDelete(cat.id)} style={{ color: "#EF4444" }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>
            ⬆️ Receitas
          </div>
          {incomeCategories.map((cat) => {
            const received = monthTxs.filter((t) => t.categoryId === cat.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
            return (
              <div key={cat.id} className="fin-category-item">
                <div className="fin-category-icon" style={{ background: `${cat.color}22` }}>{cat.icon}</div>
                <div className="fin-category-info">
                  <div className="fin-category-name">{cat.name}</div>
                  <div className="fin-category-limit">{formatCurrency(received)} recebido</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={() => { setEditing(cat); setShowModal(true); }}>✏️</button>
                  <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={() => handleDelete(cat.id)} style={{ color: "#EF4444" }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <CategoryModal category={editing} onClose={() => { setShowModal(false); setEditing(undefined); }} />
      )}
    </div>
  );
}
