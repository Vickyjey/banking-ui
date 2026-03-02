import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/loans");
      setLoans(response.data || []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load loan requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const approveLoan = async (loanId, requestedBy) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve loan ${loanId}${requestedBy ? ` for ${requestedBy}` : ""}?`
    );
    if (!confirmed) {
      return;
    }

    setProcessingId(loanId);
    setError("");
    setMessage("");

    try {
      await API.put(`/loans/${loanId}/approve`);
      if (requestedBy) {
        try {
          await API.post("/support/messages", {
            username: requestedBy,
            message: `Your loan request #${loanId} has been approved.`,
          });
        } catch (notificationError) {
          // Approval must not fail if notification delivery fails.
        }
      }

      setMessage(`Loan ${loanId} approved successfully.`);
      await fetchLoans();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to approve loan.");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = useMemo(
    () => loans.filter((loan) => loan.status === "PENDING").length,
    [loans]
  );

  return (
    <div className="app-shell admin-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Loan Desk</p>
          <h1 className="app-title">Loan Approval Queue</h1>
          <p className="app-subtitle">
            View who submitted loans, review details, and approve pending requests.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchLoans}>
            Refresh
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
            Back to Admin
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && <p className="status error">{error}</p>}
        {message && <p className="status success">{message}</p>}
        <p className="status info">Pending approvals: {pendingCount}</p>

        <section className="panel">
          <h2 className="panel-title">All Loan Requests</h2>
          {loading && <p className="status info">Loading loan requests...</p>}
          {!loading && loans.length === 0 && (
            <p className="status info">No loan requests available.</p>
          )}
          {!loading && loans.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Account</th>
                    <th>Loan Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Requested At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.requestedBy || "-"}</td>
                      <td>{loan.accountNumber}</td>
                      <td>{loan.loanType || "-"}</td>
                      <td>{Number(loan.loanAmount).toFixed(2)}</td>
                      <td>
                        <span className={`loan-status loan-status-${(loan.status || "").toLowerCase()}`}>
                          {loan.status || "UNKNOWN"}
                        </span>
                      </td>
                      <td>{loan.requestedAt ? new Date(loan.requestedAt).toLocaleString() : "-"}</td>
                      <td>
                        {loan.status === "PENDING" ? (
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => approveLoan(loan.id, loan.requestedBy)}
                            disabled={processingId === loan.id}
                          >
                            {processingId === loan.id ? "Approving..." : "Approve"}
                          </button>
                        ) : (
                          <span>-</span>
                        )}
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

export default AdminLoans;
