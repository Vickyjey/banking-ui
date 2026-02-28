import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearAuth } from "../services/auth";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [supportConversations, setSupportConversations] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userRes, accountRes, transactionRes, supportRes, loanRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/accounts"),
        API.get("/admin/transactions"),
        API.get("/support/admin/conversations"),
        API.get("/loans"),
      ]);

      setUsers(userRes.data);
      setAccounts(accountRes.data);
      setTransactions(transactionRes.data);
      setSupportConversations(supportRes.data || []);
      setLoans(loanRes.data || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Admin access required.");
      if (apiError?.response?.status === 403) {
        navigate("/dashboard", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteAccount = async (accountNumber) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete account ${accountNumber}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/account/${accountNumber}`);
      setMessage("Account deleted successfully.");
      fetchData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Delete failed.");
    }
  };

  const deleteUser = async (userId, username) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user ${username}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/user/${userId}`);
      setMessage("User deleted successfully.");
      fetchData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Delete failed.");
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const formatTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const unreadTotal = useMemo(
    () => supportConversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0),
    [supportConversations]
  );

  const unreadUsers = useMemo(
    () => supportConversations.filter((item) => item.unreadCount > 0).map((item) => item.username),
    [supportConversations]
  );

  const orderedUsers = useMemo(
    () => [...users].sort((a, b) => (a.id || 0) - (b.id || 0)),
    [users]
  );

  const pendingLoans = useMemo(
    () => loans.filter((loan) => loan.status === "PENDING").length,
    [loans]
  );

  return (
    <div className="app-shell admin-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Admin Control Center</p>
          <h1 className="app-title">Operations Dashboard</h1>
          <p className="app-subtitle">Monitor users, accounts, global transactions, and support requests.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/admin/support")}>
            Customer Support
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/admin/loans")}>
            Loan Approvals
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            User Dashboard
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && <p className="status error">{error}</p>}
        {message && <p className="status success">{message}</p>}
        {loading && <p className="status info">Loading admin data...</p>}
        {unreadTotal > 0 && (
          <p className="status info">
            New support {unreadTotal === 1 ? "query" : "queries"} from {unreadUsers.join(", ")}.
          </p>
        )}

        <section className="panel">
          <h2 className="panel-title">Action Center</h2>
          <div className="support-grid">
            <article className="support-card">
              <h3>Customer Support</h3>
              <p className="support-value">{unreadTotal} unread messages</p>
              <p>Open inbox to view users list and move into one-to-one chat conversation.</p>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate("/admin/support")}
              >
                Open Support Inbox
              </button>
            </article>
            <article className="support-card">
              <h3>Loan Requests</h3>
              <p className="support-value">{pendingLoans} pending approvals</p>
              <p>Review submitted loan applications, verify user details, and approve requests.</p>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate("/admin/loans")}
              >
                Open Loan Approvals
              </button>
            </article>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Users</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Display ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderedUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(user.id, user.username)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Accounts</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Account Number</th>
                  <th>Holder</th>
                  <th>Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.id}</td>
                    <td>{account.accountNumber}</td>
                    <td>{account.accountHolderName}</td>
                    <td>{Number(account.balance).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteAccount(account.accountNumber)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Global Transactions</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.fromAccount}</td>
                    <td>{transaction.toAccount}</td>
                    <td>{Number(transaction.amount).toFixed(2)}</td>
                    <td>{formatTime(transaction.transactionTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
