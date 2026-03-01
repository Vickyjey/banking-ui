import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Username and password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/forgot-password", {
        username: username.trim(),
        newPassword,
      });
      setSuccess(response.data || "Password updated successfully. Please login.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decor auth-decor-top" />
      <div className="auth-decor auth-decor-bottom" />
      <form className="auth-card" onSubmit={handleResetPassword}>
        <p className="eyebrow">Account Recovery</p>
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Set a new password and login again.</p>

        <label className="field-label" htmlFor="fp-username">
          Username
        </label>
        <input
          id="fp-username"
          className="input"
          placeholder="john.doe"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <label className="field-label" htmlFor="fp-new-password">
          New Password
        </label>
        <input
          id="fp-new-password"
          className="input"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />

        <label className="field-label" htmlFor="fp-confirm-password">
          Confirm New Password
        </label>
        <input
          id="fp-confirm-password"
          className="input"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        {error && <p className="status error">{error}</p>}
        {success && <p className="status success">{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        <p className="auth-switch">
          Back to <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
