import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { setAuth } from "../services/auth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const auth = setAuth(response.data);
      if (!auth) {
        setError("Invalid or expired login token.");
        return;
      }

      navigate(auth.role === "ADMIN" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decor auth-decor-top" />
      <div className="auth-decor auth-decor-bottom" />
      <form className="auth-card" onSubmit={handleLogin}>
        <p className="eyebrow">Secure Banking</p>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your accounts and payments.</p>

        <label className="field-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="input"
          placeholder="jane.smith"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="status error">{error}</p>}
        <p className="auth-switch">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
