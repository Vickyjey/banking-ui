import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/register", {
        username: username.trim(),
        password,
      });
      setSuccess("Account created successfully.");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decor auth-decor-top" />
      <div className="auth-decor auth-decor-bottom" />
      <form className="auth-card" onSubmit={handleRegister}>
        <p className="eyebrow">New Profile</p>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Register once and access all banking features.</p>

        <label className="field-label" htmlFor="reg-username">
          Username
        </label>
        <input
          id="reg-username"
          className="input"
          placeholder="john.doe"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label className="field-label" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          className="input"
          type="password"
          placeholder="Choose a secure password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />

        {error && <p className="status error">{error}</p>}
        {success && <p className="status success">{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
