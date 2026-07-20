import { useFinance } from "../store";
import { formatCurrency, formatDate, formatMonth, prevMonth, nextMonth, getMonthTransactions, getAccountBalance } from "../utils";

function DonutChart({ data }: { data: { color: string; value: number; label: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="fin-empty"><span>Sem dados</span></div>;

  const size = 120;
  const radius = 48;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const slice = { ...d, dasharray: `${dash} ${circumference - dash}`, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="fin-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={22}
            strokeDasharray={s.dasharray}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={34} fill="white" />
      </svg>
      <div className="fin-legend">
        {data.slice(0, 6).map((d, i) => (
          <div key={i} className="fin-legend-item">
            <div className="fin-legend-dot" style={{ background: d.color }} />
            <span className="fin-legend-name">{d.label}</span>
            <span className="fin-legend-value">{formatCurrency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { state, dispatch } = useFinance();
  const { currentMonth, transactions, accounts, categories } = state;

  const monthTxs = getMonthTransactions(transactions, currentMonth);
  const totalIncome = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const totalAssets = accounts
    .filter((a) => a.includeInTotal)
    .reduce((s, a) => s + getAccountBalance(a, transactions), 0);

  const expenseByCategory = categories
    .filter((c) => c.type !== "income")
    .map((c) => ({
      label: `${c.icon} ${c.name}`,
      color: c.color,
      value: monthTxs.filter((t) => t.type === "expense" && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const recent = [...monthTxs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const pending = monthTxs.filter((t) => !t.paid);

  return (
    <div>
      {/* Month navigator */}
      <div className="fin-month-nav" style={{ marginBottom: 16 }}>
        <button onClick={() => dispatch({ type: "SET_MONTH", payload: prevMonth(currentMonth) })}>‹</button>
        <span>{formatMonth(currentMonth)}</span>
        <button onClick={() => dispatch({ type: "SET_MONTH", payload: nextMonth(currentMonth) })}>›</button>
      </div>

      {/* Summary cards */}
      <div className="fin-summary-grid">
        <div className="fin-summary-card">
          <div className="fin-summary-label">🏦 Saldo Total</div>
          <div className="fin-summary-value">{formatCurrency(totalAssets)}</div>
          <div className="fin-summary-sub">Todas as contas</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">⬆️ Receitas</div>
          <div className="fin-summary-value positive">{formatCurrency(totalIncome)}</div>
          <div className="fin-summary-sub">No mês</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">⬇️ Despesas</div>
          <div className="fin-summary-value negative">{formatCurrency(totalExpenses)}</div>
          <div className="fin-summary-sub">No mês</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">💰 Balanço</div>
          <div className={`fin-summary-value ${balance >= 0 ? "positive" : "negative"}`}>{formatCurrency(balance)}</div>
          <div className="fin-summary-sub">Receitas - Despesas</div>
        </div>
      </div>

      <div className="fin-dash-grid">
        {/* Left column */}
        <div>
          {/* Recent transactions */}
          <div className="fin-card" style={{ marginBottom: 16 }}>
            <div className="fin-card-header">
              <span className="fin-card-title">Últimas Transações</span>
              <button
                className="fin-btn fin-btn-ghost fin-btn-sm"
                onClick={() => dispatch({ type: "SET_VIEW", payload: "transactions" })}
              >
                Ver todas
              </button>
            </div>
            {recent.length === 0 ? (
              <div className="fin-empty">
                <div className="fin-empty-icon">📭</div>
                <p>Nenhuma transação neste mês</p>
              </div>
            ) : (
              recent.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div key={tx.id} className="fin-tx-item">
                    <div
                      className="fin-tx-icon"
                      style={{ background: cat ? `${cat.color}22` : "#F1F5F9" }}
                    >
                      {cat?.icon || "📦"}
                    </div>
                    <div className="fin-tx-info">
                      <div className="fin-tx-desc">{tx.description}</div>
                      <div className="fin-tx-meta">
                        {formatDate(tx.date)} · {cat?.name}
                        {tx.installments && ` · ${tx.installmentNumber}/${tx.installments}x`}
                      </div>
                    </div>
                    <div className={`fin-tx-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                    <div className={`fin-tx-status ${tx.paid ? "paid" : "unpaid"}`} title={tx.paid ? "Pago" : "Pendente"} />
                  </div>
                );
              })
            )}
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <div className="fin-card">
              <div className="fin-card-header">
                <span className="fin-card-title">⚠️ Pendências ({pending.length})</span>
                <span className="fin-badge fin-badge-yellow">
                  {formatCurrency(pending.reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
              {pending.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div key={tx.id} className="fin-tx-item">
                    <div className="fin-tx-icon" style={{ background: "#FEF3C7" }}>
                      {cat?.icon || "📦"}
                    </div>
                    <div className="fin-tx-info">
                      <div className="fin-tx-desc">{tx.description}</div>
                      <div className="fin-tx-meta">Vence: {formatDate(tx.date)}</div>
                    </div>
                    <div className={`fin-tx-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Donut by category */}
          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-title">Gastos por Categoria</span>
            </div>
            <DonutChart data={expenseByCategory} />
          </div>

          {/* Accounts */}
          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-title">Contas</span>
              <button
                className="fin-btn fin-btn-ghost fin-btn-sm"
                onClick={() => dispatch({ type: "SET_VIEW", payload: "accounts" })}
              >
                Ver
              </button>
            </div>
            {accounts.filter((a) => a.includeInTotal).map((acc) => {
              const balance = getAccountBalance(acc, transactions);
              return (
                <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: acc.color }} />
                    <span style={{ fontSize: 13, color: "#475569" }}>{acc.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: balance >= 0 ? "#1E293B" : "#EF4444" }}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
