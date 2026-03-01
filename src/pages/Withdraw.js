import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Withdraw() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleWithdraw = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const value = Number.parseFloat(amount);
    if (!accountNumber.trim() || Number.isNaN(value) || value <= 0) {
      setError("Enter a valid account number and positive amount.");
      return;
    }

    try {
      const response = await API.post("/accounts/withdraw", {
        accountNumber: accountNumber.trim(),
        amount: value,
      });
      setMessage(response.data || "Withdrawn successfully.");
      setAmount("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Withdraw failed.");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="app-title">Withdraw Funds</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        <form className="panel form-panel" onSubmit={handleWithdraw}>
          <label className="field-label" htmlFor="withdraw-account-number">
            Account Number
          </label>
          <input
            id="withdraw-account-number"
            className="input"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            placeholder="ACC-1024"
          />

          <label className="field-label" htmlFor="withdraw-amount">
            Amount
          </label>
          <input
            id="withdraw-amount"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="250"
          />

          {error && <p className="status error">{error}</p>}
          {message && <p className="status success">{message}</p>}

          <button className="btn btn-primary" type="submit">
            Withdraw
          </button>
        </form>
      </main>
    </div>
  );
}

export default Withdraw;
