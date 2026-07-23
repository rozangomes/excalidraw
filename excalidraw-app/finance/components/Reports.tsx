import { useFinance } from "../store";
import { formatCurrency, prevMonth } from "../utils";

function BarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const barWidth = 24;
  const gap = 8;
  const groupWidth = barWidth * 2 + gap + 16;
  const chartHeight = 180;
  const svgWidth = data.length * groupWidth + 20;

  return (
    <div className="fin-chart-container">
      <svg width={svgWidth} height={chartHeight + 40} style={{ display: "block" }}>
        {data.map((d, i) => {
          const x = i * groupWidth + 10;
          const incH = (d.income / max) * chartHeight;
          const expH = (d.expense / max) * chartHeight;
          return (
            <g key={i}>
              <title>{d.label}: Receita {formatCurrency(d.income)}, Despesa {formatCurrency(d.expense)}</title>
              {/* income bar */}
              <rect
                x={x}
                y={chartHeight - incH}
                width={barWidth}
                height={incH}
                fill="#10B981"
                rx={4}
              />
              {/* expense bar */}
              <rect
                x={x + barWidth + gap}
                y={chartHeight - expH}
                width={barWidth}
                height={expH}
                fill="#EF4444"
                rx={4}
              />
              {/* label */}
              <text
                x={x + barWidth + gap / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fontSize={10}
                fill="#64748B"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#10B981" }} />
          Receitas
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#EF4444" }} />
          Despesas
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const { state } = useFinance();
  const { transactions, categories, currentMonth } = state;

  // Last 6 months
  const months: string[] = [];
  let m = currentMonth;
  for (let i = 0; i < 6; i++) {
    months.unshift(m);
    m = prevMonth(m);
  }

  const barData = months.map((month) => {
    const txs = transactions.filter((t) => t.date.startsWith(month));
    const label = month.split("-")[1] + "/" + month.split("-")[0].slice(2);
    return {
      label,
      income: txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Category breakdown for current month
  const currentTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalExpenses = currentTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const catBreakdown = categories
    .map((cat) => ({
      cat,
      spent: currentTxs.filter((t) => t.categoryId === cat.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
    }))
    .filter((x) => x.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const avgExpenses = barData.reduce((s, d) => s + d.expense, 0) / barData.length;
  const avgIncome = barData.reduce((s, d) => s + d.income, 0) / barData.length;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <div>
      {/* KPIs */}
      <div className="fin-summary-grid" style={{ marginBottom: 20 }}>
        <div className="fin-summary-card">
          <div className="fin-summary-label">📊 Média Mensal Receitas</div>
          <div className="fin-summary-value positive">{formatCurrency(avgIncome)}</div>
          <div className="fin-summary-sub">Últimos 6 meses</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">📉 Média Mensal Despesas</div>
          <div className="fin-summary-value negative">{formatCurrency(avgExpenses)}</div>
          <div className="fin-summary-sub">Últimos 6 meses</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">💰 Taxa de Poupança</div>
          <div className={`fin-summary-value ${savingsRate >= 20 ? "positive" : savingsRate >= 0 ? "" : "negative"}`}>
            {savingsRate.toFixed(1)}%
          </div>
          <div className="fin-summary-sub">Mês atual</div>
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-label">🎯 Balanço do Mês</div>
          <div className={`fin-summary-value ${totalIncome - totalExpenses >= 0 ? "positive" : "negative"}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </div>
          <div className="fin-summary-sub">Receitas - Despesas</div>
        </div>
      </div>

      <div className="fin-dash-grid">
        <div>
          {/* Bar chart */}
          <div className="fin-card" style={{ marginBottom: 16 }}>
            <div className="fin-card-header">
              <span className="fin-card-title">Evolução Mensal (últimos 6 meses)</span>
            </div>
            <BarChart data={barData} />
          </div>

          {/* Month totals table */}
          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-title">Resumo por Mês</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "#64748B", fontWeight: 600 }}>Mês</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "#10B981", fontWeight: 600 }}>Receitas</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "#EF4444", fontWeight: 600 }}>Despesas</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "#1E293B", fontWeight: 600 }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((row, i) => {
                  const saldo = row.income - row.expense;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding: "8px 4px", color: "#475569" }}>{months[i]}</td>
                      <td style={{ padding: "8px 4px", textAlign: "right", color: "#10B981", fontWeight: 500 }}>{formatCurrency(row.income)}</td>
                      <td style={{ padding: "8px 4px", textAlign: "right", color: "#EF4444", fontWeight: 500 }}>{formatCurrency(row.expense)}</td>
                      <td style={{ padding: "8px 4px", textAlign: "right", color: saldo >= 0 ? "#10B981" : "#EF4444", fontWeight: 600 }}>{formatCurrency(saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-title">Despesas por Categoria</span>
            </div>
            {catBreakdown.length === 0 ? (
              <div className="fin-empty"><p>Sem despesas neste mês.</p></div>
            ) : (
              catBreakdown.map(({ cat, spent }) => {
                const pct = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
                return (
                  <div key={cat.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{cat.icon}</span>
                        <span style={{ color: "#475569" }}>{cat.name}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: "#1E293B" }}>
                        {formatCurrency(spent)} <span style={{ color: "#94A3B8", fontSize: 11 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="fin-progress">
                      <div className="fin-progress-bar" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                    {cat.monthlyLimit && (
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                        Limite: {formatCurrency(cat.monthlyLimit)}
                        {spent > cat.monthlyLimit && (
                          <span style={{ color: "#EF4444", marginLeft: 4 }}>
                            (+{formatCurrency(spent - cat.monthlyLimit)} acima)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
