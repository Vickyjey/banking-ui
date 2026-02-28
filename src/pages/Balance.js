import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Balance() {
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkBalance = async (event) => {
    event.preventDefault();
    setError("");

    if (!accountNumber.trim()) {
      setError("Account number is required.");
      return;
    }

    try {
      const response = await API.get(`/accounts/${accountNumber.trim()}`);
      setBalance(response.data.balance);
    } catch (apiError) {
      setBalance(null);
      setError(apiError?.response?.data?.message || "Account not found.");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1 className="app-title">Check Balance</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        <form className="panel form-panel" onSubmit={checkBalance}>
          <label className="field-label" htmlFor="balance-account-number">
            Account Number
          </label>
          <input
            id="balance-account-number"
            className="input"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            placeholder="ACC-1024"
          />

          {error && <p className="status error">{error}</p>}

          {balance !== null && (
            <p className="status info">Current Balance: {Number(balance).toFixed(2)}</p>
          )}

          <button className="btn btn-primary" type="submit">
            Check Balance
          </button>
        </form>
      </main>
    </div>
  );
}

export default Balance;
