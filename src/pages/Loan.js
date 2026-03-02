import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const loanTypeOptions = [
  "Personal Loan",
  "Home Loan",
  "Car Loan",
  "Education Loan",
  "Gold Loan",
];
const APPROVED_LOAN_IDS_KEY = "approved_loan_ids_seen";

function Loan() {
  const [accountNumber, setAccountNumber] = useState("");
  const [loanType, setLoanType] = useState(loanTypeOptions[0]);
  const [loanAmount, setLoanAmount] = useState("");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvalNotice, setApprovalNotice] = useState("");
  const seenApprovedLoanIdsRef = useRef(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(APPROVED_LOAN_IDS_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        seenApprovedLoanIdsRef.current = new Set(parsed);
      }
    } catch (storageError) {
      seenApprovedLoanIdsRef.current = new Set();
    }
  }, []);

  const persistSeenApprovedLoans = () => {
    localStorage.setItem(
      APPROVED_LOAN_IDS_KEY,
      JSON.stringify(Array.from(seenApprovedLoanIdsRef.current))
    );
  };

  const fetchLoans = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await API.get("/loans");
      const nextLoans = response.data || [];
      setLoans(nextLoans);
      setError("");

      const newlyApproved = [];
      for (const loan of nextLoans) {
        if (loan?.status !== "APPROVED" || loan?.id === undefined || loan?.id === null) {
          continue;
        }

        if (!seenApprovedLoanIdsRef.current.has(loan.id)) {
          seenApprovedLoanIdsRef.current.add(loan.id);
          newlyApproved.push(loan.id);
        }
      }

      if (newlyApproved.length > 0) {
        persistSeenApprovedLoans();
        if (newlyApproved.length === 1) {
          setApprovalNotice(`Loan ${newlyApproved[0]} has been approved.`);
        } else {
          setApprovalNotice(`${newlyApproved.length} loans have been approved.`);
        }
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load loans.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchLoans();

    const intervalId = window.setInterval(() => {
      fetchLoans(false);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchLoans]);

  const handleApplyLoan = async (event) => {
    event.preventDefault();
    const normalizedAccount = accountNumber.trim();
    const normalizedLoanType = loanType.trim();
    const amount = Number(loanAmount);

    if (!normalizedAccount) {
      setError("Account number is required.");
      setSuccess("");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Loan amount must be greater than zero.");
      setSuccess("");
      return;
    }

    if (!normalizedLoanType) {
      setError("Loan type is required.");
      setSuccess("");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/loans", {
        accountNumber: normalizedAccount,
        loanType: normalizedLoanType,
        loanAmount: amount,
      });
      setSuccess("Loan application submitted.");
      setAccountNumber("");
      setLoanType(loanTypeOptions[0]);
      setLoanAmount("");
      await fetchLoans();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to submit loan application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Loan Desk</p>
          <h1 className="app-title">Loan Applications</h1>
          <p className="app-subtitle">Apply for new loans and track all requests from this page.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main">
        <section className="panel form-panel">
          <h2 className="panel-title">Apply for Loan</h2>
          <form className="inline-form" onSubmit={handleApplyLoan}>
            <input
              className="input"
              placeholder="Account Number (ACC-1001)"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              aria-label="Account Number"
            />
            <select
              className="input"
              value={loanType}
              onChange={(event) => setLoanType(event.target.value)}
              aria-label="Loan Type"
            >
              {loanTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min="1"
              step="0.01"
              placeholder="Loan Amount"
              value={loanAmount}
              onChange={(event) => setLoanAmount(event.target.value)}
              aria-label="Loan Amount"
            />
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Apply"}
            </button>
          </form>
          {error && <p className="status error">{error}</p>}
          {success && <p className="status success">{success}</p>}
          {approvalNotice && <p className="status success">{approvalNotice}</p>}
        </section>

        <section className="panel">
          <h2 className="panel-title">Loan History</h2>
          {loading && <p className="status info">Loading loans...</p>}
          {!loading && loans.length === 0 && (
            <p className="status info">No loans submitted yet.</p>
          )}
          {!loading && loans.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Account Number</th>
                    <th>Loan Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Requested By</th>
                    <th>Requested At</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.accountNumber}</td>
                      <td>{loan.loanType || "-"}</td>
                      <td>{Number(loan.loanAmount).toFixed(2)}</td>
                      <td>
                        <span className={`loan-status loan-status-${(loan.status || "").toLowerCase()}`}>
                          {loan.status || "UNKNOWN"}
                        </span>
                      </td>
                      <td>{loan.requestedBy || "-"}</td>
                      <td>
                        {loan.requestedAt
                          ? new Date(loan.requestedAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Loan;
