import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Transfer() {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleTransfer = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const value = Number.parseFloat(amount);
    if (!fromAccount.trim() || !toAccount.trim() || Number.isNaN(value) || value <= 0) {
      setError("Enter valid accounts and a positive amount.");
      return;
    }

    try {
      const response = await API.post("/accounts/transfer", {
        fromAccount: fromAccount.trim(),
        toAccount: toAccount.trim(),
        amount: value,
      });

      setMessage(
        `${response.data.message}. Remaining balance: ${response.data.remainingBalance}`
      );
      setAmount("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Transfer failed.");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="app-title">Transfer Money</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        <form className="panel form-panel" onSubmit={handleTransfer}>
          <label className="field-label" htmlFor="from-account">
            From Account
          </label>
          <input
            id="from-account"
            className="input"
            value={fromAccount}
            onChange={(event) => setFromAccount(event.target.value)}
            placeholder="ACC-1001"
          />

          <label className="field-label" htmlFor="to-account">
            To Account
          </label>
          <input
            id="to-account"
            className="input"
            value={toAccount}
            onChange={(event) => setToAccount(event.target.value)}
            placeholder="ACC-2022"
          />

          <label className="field-label" htmlFor="transfer-amount">
            Amount
          </label>
          <input
            id="transfer-amount"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="120"
          />

          {error && <p className="status error">{error}</p>}
          {message && <p className="status success">{message}</p>}

          <button className="btn btn-primary" type="submit">
            Transfer
          </button>
        </form>
      </main>
    </div>
  );
}

export default Transfer;
