import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CreateAccount() {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [balance, setBalance] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const amount = Number.parseFloat(balance);
    if (!accountNumber.trim() || !accountHolderName.trim() || Number.isNaN(amount)) {
      setError("Please provide account number, holder name, and valid balance.");
      return;
    }

    try {
      await API.post("/accounts", {
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        balance: amount,
      });
      setMessage("Account created successfully.");
      setAccountNumber("");
      setAccountHolderName("");
      setBalance("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Error creating account.");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1 className="app-title">Create Account</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        <form className="panel form-panel" onSubmit={handleCreate}>
          <label className="field-label" htmlFor="account-number">
            Account Number
          </label>
          <input
            id="account-number"
            className="input"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            placeholder="ACC-1024"
          />

          <label className="field-label" htmlFor="account-holder">
            Account Holder Name
          </label>
          <input
            id="account-holder"
            className="input"
            value={accountHolderName}
            onChange={(event) => setAccountHolderName(event.target.value)}
            placeholder="John Smith"
          />

          <label className="field-label" htmlFor="initial-balance">
            Initial Balance
          </label>
          <input
            id="initial-balance"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="1000"
          />

          {error && <p className="status error">{error}</p>}
          {message && <p className="status success">{message}</p>}

          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateAccount;
