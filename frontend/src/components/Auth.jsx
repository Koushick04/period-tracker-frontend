import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // Import optimized CSS

import API_URL from "../config";

export default function Auth({ setToken }) {
  // MODES: 'login', 'register', 'forgot', 'reset'
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPassword.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "login" || mode === "register") {
        /* ---------------- LOGIN / REGISTER ---------------- */
        if (mode === "register") {
          if (!email.endsWith("@gmail.com")) throw new Error("Email must be a valid @gmail.com address");
          if (!validatePassword(password)) throw new Error("Password must contain 1 uppercase, 1 number, 1 special char, and be 8+ chars.");
        }

        const url = mode === "login"
          ? `${API_URL}/api/auth/login`
          : `${API_URL}/api/auth/register`;

        const payload = mode === "login" ? { email, password } : { email, password, name };
        const res = await axios.post(url, payload);

        const token = res.data.token;
        if (!token) throw new Error("Token error");

        localStorage.setItem("token", token);
        setToken(token);
        navigate("/calendar");

      } else if (mode === "forgot") {
        /* ---------------- FORGOT PASSWORD ---------------- */
        if (!email.endsWith("@gmail.com")) throw new Error("Please enter your registered @gmail.com address");

        await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
        setMode("reset");
        setSuccess("OTP sent to your email (Check backend console for Mock OTP)");

      } else if (mode === "reset") {
        /* ---------------- RESET PASSWORD ---------------- */
        if (!validatePassword(password)) throw new Error("New password must contain 1 uppercase, 1 number, 1 special char, and be 8+ chars.");

        await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword: password });
        setMode("login");
        setSuccess("Password reset successful! Please login.");
        setPassword("");
        setOtp("");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "An error occurred");
    }
  };

  const renderTitle = () => {
    if (mode === "login") return "Welcome Back";
    if (mode === "register") return "Join Us";
    if (mode === "forgot") return "Forgot Password";
    if (mode === "reset") return "Reset Password";
  };

  const renderSubtitle = () => {
    if (mode === "login") return "Track your cycle with ease";
    if (mode === "register") return "Start your journey today";
    if (mode === "forgot") return "Enter email to receive OTP";
    if (mode === "reset") return "Enter OTP and new password";
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card" autoComplete="off">
        <h2 className="auth-title">{renderTitle()}</h2>
        <p className="auth-subtitle">
          {renderSubtitle()}
        </p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          required={mode !== "reset"}
          readOnly={mode === "reset"}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          className="auth-input"
        />

        {/* NAME (Register only) */}
        {mode === "register" && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
          />
        )}

        {/* OTP (Reset only) */}
        {mode === "reset" && (
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            required
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
            className="auth-input"
          />
        )}

        {/* PASSWORD */}
        {mode !== "forgot" && (
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === "reset" ? "New Password" : "Password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="password-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        )}

        <button type="submit" className="auth-button">
          {mode === "login" && "Login"}
          {mode === "register" && "Create Account"}
          {mode === "forgot" && "Send OTP"}
          {mode === "reset" && "Reset Password"}
        </button>

        {/* LINKS */}
        <div className="auth-links">
          {mode === "login" && (
            <>
              <p className="auth-link-text" onClick={() => { setMode("forgot"); setError(""); }}>Forgot Password?</p>
              <p className="auth-switch-text">
                New user? <span className="auth-switch-link" onClick={() => { setMode("register"); setError(""); }}>Create account</span>
              </p>
            </>
          )}

          {mode === "register" && (
            <p className="auth-switch-text">
              Already have an account? <span className="auth-switch-link" onClick={() => { setMode("login"); setError(""); }}>Login</span>
            </p>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <p className="auth-link-text" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Back to Login</p>
          )}
        </div>

      </form>
    </div>
  );
}
