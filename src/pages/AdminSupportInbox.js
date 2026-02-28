import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminSupportInbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await API.get("/support/admin/conversations");
      setConversations(response.data || []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load support inbox.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const timer = setInterval(fetchConversations, 5000);
    return () => clearInterval(timer);
  }, [fetchConversations]);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0),
    [conversations]
  );

  const formatTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="app-shell admin-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Customer Support</p>
          <h1 className="app-title">Support Inbox</h1>
          <p className="app-subtitle">
            WhatsApp-style conversation list. Select a user to open the full chat page.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchConversations}>
            Refresh
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
            Back to Admin
          </button>
        </div>
      </header>

      <main className="app-main single-column">
        {error && <p className="status error">{error}</p>}
        <p className="status info">Unread messages: {unreadTotal}</p>

        <section className="panel">
          <h2 className="panel-title">User Conversations</h2>
          <div className="support-conversation-list">
            {loading && <p className="status info">Loading support inbox...</p>}
            {!loading && conversations.length === 0 && (
              <p className="status info">No support conversations yet.</p>
            )}
            {conversations.map((item) => (
              <button
                key={item.username}
                type="button"
                className="conversation-item"
                onClick={() => navigate(`/admin/support/${item.username}`)}
              >
                <div className="conversation-item-top">
                  <strong>{item.username}</strong>
                  {item.unreadCount > 0 && (
                    <span className="conversation-badge">{item.unreadCount}</span>
                  )}
                </div>
                <p>{item.latestMessage}</p>
                <small>{formatTime(item.latestTime)}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminSupportInbox;
