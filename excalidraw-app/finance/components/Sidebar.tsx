import { useFinance } from "../store";
import type { View } from "../types";

const navItems: { icon: string; label: string; view: View }[] = [
  { icon: "📊", label: "Dashboard", view: "dashboard" },
  { icon: "🏦", label: "Contas", view: "accounts" },
  { icon: "💳", label: "Cartões", view: "credit-cards" },
  { icon: "↕️", label: "Transações", view: "transactions" },
  { icon: "🏷️", label: "Categorias", view: "categories" },
  { icon: "📈", label: "Relatórios", view: "reports" },
];

export function Sidebar() {
  const { state, dispatch } = useFinance();

  return (
    <aside className="fin-sidebar">
      <div className="fin-sidebar-logo">
        <h1>Organizze</h1>
        <p>Controle financeiro</p>
      </div>
      <nav className="fin-nav">
        <div className="fin-nav-label">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`fin-nav-item${state.currentView === item.view ? " active" : ""}`}
            onClick={() => dispatch({ type: "SET_VIEW", payload: item.view })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
