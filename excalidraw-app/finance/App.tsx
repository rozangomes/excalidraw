import "./finance.css";
import { FinanceProvider, useFinance } from "./store";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Accounts } from "./components/Accounts";
import { CreditCards } from "./components/CreditCards";
import { Transactions } from "./components/Transactions";
import { Categories } from "./components/Categories";
import { Reports } from "./components/Reports";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Contas",
  "credit-cards": "Cartões de Crédito",
  transactions: "Transações",
  categories: "Categorias",
  reports: "Relatórios",
};

function FinanceContent() {
  const { state, storageNotice, dismissStorageNotice } = useFinance();

  const renderView = () => {
    switch (state.currentView) {
      case "dashboard": return <Dashboard />;
      case "accounts": return <Accounts />;
      case "credit-cards": return <CreditCards />;
      case "transactions": return <Transactions />;
      case "categories": return <Categories />;
      case "reports": return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="fin-app">
      <Sidebar />
      <main className="fin-main">
        <header className="fin-header">
          <h2>{VIEW_TITLES[state.currentView]}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Seus dados ficam salvos localmente</span>
            <a
              href="/"
              style={{ fontSize: 12, color: "#3B82F6", textDecoration: "none", padding: "6px 12px", border: "1px solid #DBEAFE", borderRadius: 6, background: "#EFF6FF" }}
            >
              ← Voltar ao Excalidraw
            </a>
          </div>
        </header>
        {storageNotice && (
          <div className="fin-storage-banner">
            <span>⚠️ {storageNotice}</span>
            <button onClick={dismissStorageNotice} aria-label="Fechar aviso">✕</button>
          </div>
        )}
        <div className="fin-content">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function FinanceApp() {
  return (
    <FinanceProvider>
      <FinanceContent />
    </FinanceProvider>
  );
}
