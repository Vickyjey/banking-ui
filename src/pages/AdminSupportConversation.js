import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function AdminSupportConversation() {
  const { username } = useParams();
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const markRead = useCallback(async () => {
    if (!username) {
      return;
    }

    await API.put(`/support/admin/messages/${username}/read`);
  }, [username]);

  const fetchMessages = useCallback(async () => {
    if (!username) {
      return;
    }

    try {
      const response = await API.get(`/support/admin/messages/${username}`);
      setMessages(response.data || []);
      setError("");
      await markRead();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load conversation.");
    } finally {
      setLoading(false);
    }
  }, [markRead, username]);

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  const sendReply = async (event) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !username) {
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/support/messages", {
        username,
        message: text,
      });
      setReply("");
      setSuccess("Reply sent.");
      await fetchMessages();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="app-shell admin-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Customer Support</p>
          <h1 className="app-title">Conversation: {username}</h1>
          <p className="app-subtitle">
            Only this user conversation is shown here. View history and reply from this screen.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/admin/support")}>
            Back to Inbox
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
            Back to Admin
          </button>
        </div>
      </header>

      <main className="app-main single-column">
        {error && <p className="status error">{error}</p>}
        {success && <p className="status success">{success}</p>}

        <section className="panel chat-panel">
          <h2 className="panel-title">Message History</h2>
          <div className="chat-thread admin-chat-thread">
            {loading && <p className="status info">Loading conversation...</p>}
            {!loading && messages.length === 0 && (
              <p className="status info">No messages yet for this user.</p>
            )}
            {messages.map((item) => (
              <div
                key={item.id}
                className={`chat-bubble ${
                  item.senderRole === "ADMIN" ? "chat-bubble-user" : "chat-bubble-admin"
                }`}
              >
                <p className="chat-meta">
                  {item.senderRole === "ADMIN" ? "You" : item.username} • {formatTime(item.sentAt)}
                </p>
                <p className="chat-text">{item.message}</p>
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={sendReply}>
            <input
              className="input"
              placeholder="Reply to user..."
              value={reply}
              onChange={(event) => setReply(event.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminSupportConversation;
