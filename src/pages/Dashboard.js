import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../services/auth";

function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();

  const tiles = useMemo(
    () => [
      {
        title: "Create Account",
        detail: "Open a new account profile with initial balance.",
        path: "/create-account",
      },
      {
        title: "Deposit Funds",
        detail: "Add money to any existing account.",
        path: "/deposit",
      },
      {
        title: "Withdraw Funds",
        detail: "Withdraw money and reduce account balance instantly.",
        path: "/withdraw",
      },
      {
        title: "Transfer Money",
        detail: "Move funds between accounts instantly.",
        path: "/transfer",
      },
      {
        title: "Check Balance",
        detail: "Review available balance by account number.",
        path: "/balance",
      },
      {
        title: "My Transactions",
        detail: "Load account-scoped transfer history.",
        path: "/transactions",
      },
      {
        title: "Customer Support",
        detail: "Get assistance and escalation contacts.",
        path: "/support",
      },
      {
        title: "Loan Services",
        detail: "Apply for a loan and track request status.",
        path: "/loans",
      },
    ],
    []
  );

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Retail Banking</p>
          <h1 className="app-title">Welcome {auth?.username || "User"}</h1>
          <p className="app-subtitle">Use the shortcuts below to complete your daily operations.</p>
        </div>
        <div className="header-actions">
          {auth?.role === "ADMIN" && (
            <button className="btn btn-secondary" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="panel">
          <h2 className="panel-title">Quick Actions</h2>
          <div className="tile-grid">
            {tiles.map((tile) => (
              <button
                key={tile.path}
                className="tile"
                onClick={() => navigate(tile.path)}
                type="button"
              >
                <span className="tile-title">{tile.title}</span>
                <span className="tile-detail">{tile.detail}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <button
        className="chat-launcher"
        type="button"
        onClick={() => navigate("/support")}
      >
        <span aria-hidden="true">💬</span>
        Ask an agent
      </button>
    </div>
  );
}

export default Dashboard;
