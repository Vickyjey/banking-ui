import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getAuth } from "../services/auth";

const supportContacts = [
  {
    label: "Support Phone",
    value: "+1 (800) 555-0148",
    detail: "Mon-Sat, 8:00 AM - 8:00 PM",
  },
  {
    label: "Support Email",
    value: "help@bankcore.example",
    detail: "Response in 2-4 business hours",
  },
  {
    label: "Escalation Desk",
    value: "risk-team@bankcore.example",
    detail: "Urgent transaction escalation",
  },
];

const faqs = [
  {
    question: "How fast are transfers processed?",
    answer: "Most transfers are processed instantly. In rare validation cases, it may take up to 30 minutes.",
  },
  {
    question: "What if I transferred to the wrong account?",
    answer: "Message support immediately with transaction ID and target account number for investigation.",
  },
  {
    question: "How can I track my support request?",
    answer: "All updates from support are available in this chat and highlighted as replies.",
  },
];

function Support() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const response = await API.get("/support/messages/me");
      setMessages(response.data || []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load support messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await API.post("/support/messages", { message });
      setText("");
      await fetchMessages();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const unreadAdminReplies = useMemo(
    () => messages.filter((item) => item.senderRole === "ADMIN").length,
    [messages]
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Help Center</p>
          <h1 className="app-title">Customer Support Chat</h1>
          <p className="app-subtitle">
            Ask anything and our support team will reply here. Signed in as {auth?.username || "user"}.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="app-main single-column">
        {unreadAdminReplies > 0 && (
          <p className="status info">
            You have {unreadAdminReplies} support {(unreadAdminReplies === 1 && "reply") || "replies"}.
          </p>
        )}
        {error && <p className="status error">{error}</p>}

        <section className="panel">
          <h2 className="panel-title">Contact Details</h2>
          <div className="support-grid">
            {supportContacts.map((item) => (
              <article key={item.label} className="support-card">
                <h3>{item.label}</h3>
                <p className="support-value">{item.value}</p>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">FAQ</h2>
          <div className="faq-list">
            {faqs.map((item) => (
              <article key={item.question} className="faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel chat-panel">
          <h2 className="panel-title">Live Chat</h2>
          <div className="chat-thread">
            {loading && <p className="status info">Loading chat...</p>}
            {!loading && messages.length === 0 && (
              <p className="status info">No conversation yet. Start by sending your first message.</p>
            )}
            {messages.map((item) => (
              <div
                key={item.id}
                className={`chat-bubble ${item.senderRole === "USER" ? "chat-bubble-user" : "chat-bubble-admin"}`}
              >
                <p className="chat-meta">
                  {item.senderRole === "USER" ? "You" : "Support"} • {new Date(item.sentAt).toLocaleString()}
                </p>
                <p className="chat-text">{item.message}</p>
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSend}>
            <input
              className="input"
              placeholder="Write your message..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Support;
