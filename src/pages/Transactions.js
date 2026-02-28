import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Transactions() {
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const fetchTransactions = async (event) => {
    event.preventDefault();
    setError("");

    if (!accountNumber.trim()) {
      setError("Account number is required.");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await API.get(`/transactions/account/${accountNumber.trim()}`);
      setTransactions(response.data);
    } catch (apiError) {
      setTransactions([]);
      setError(
        apiError?.response?.status === 403
          ? "You do not have permission to view this data."
          : apiError?.response?.data?.message || "Could not load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="app-title">My Transactions</h1>
          <p className="app-subtitle">Search by account number to view outgoing and incoming transfers.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        <form className="panel form-panel" onSubmit={fetchTransactions}>
          <label className="field-label" htmlFor="txn-account-number">
            Account Number
          </label>
          <div className="inline-form">
            <input
              id="txn-account-number"
              className="input"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="ACC-1024"
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Load"}
            </button>
          </div>

          {error && <p className="status error">{error}</p>}
          {!error && searched && !loading && transactions.length === 0 && (
            <p className="status info">No transactions found for this account.</p>
          )}
        </form>

        <section className="panel">
          <h2 className="panel-title">Transaction History</h2>
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
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.id}</td>
                    <td>{txn.fromAccount}</td>
                    <td>{txn.toAccount}</td>
                    <td>{Number(txn.amount).toFixed(2)}</td>
                    <td>{renderTime(txn.transactionTime)}</td>
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

export default Transactions;
