import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="auth-bg" style={container}>
      <form onSubmit={handleSubmit} style={card} className="fade-in">
        <h2 style={title}>{renderTitle()}</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          {renderSubtitle()}
        </p>

        {error && <p style={errorStyle}>{error}</p>}
        {success && <p style={successStyle}>{success}</p>}

        {/* EMAIL (Always visible except maybe reset? No keep it for context) */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          required={mode !== "reset"} // In reset mode, it's pre-filled/readonly usually, but let's keep it editable just in case
          readOnly={mode === "reset"} // Lock email during reset to ensure match
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        {/* NAME (Register only) */}
        {mode === "register" && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            style={input}
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
            style={input}
          />
        )}

        {/* PASSWORD (Login, Register, Reset) - Hidden in Forgot */}
        {mode !== "forgot" && (
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === "reset" ? "New Password" : "Password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={passwordInput}
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

        <button type="submit" style={button}>
          {mode === "login" && "Login"}
          {mode === "register" && "Create Account"}
          {mode === "forgot" && "Send OTP"}
          {mode === "reset" && "Reset Password"}
        </button>

        {/* LINKS */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {mode === "login" && (
            <>
              <p style={linkText} onClick={() => { setMode("forgot"); setError(""); }}>Forgot Password?</p>
              <p style={switchText}>
                New user? <span style={switchLink} onClick={() => { setMode("register"); setError(""); }}>Create account</span>
              </p>
            </>
          )}

          {mode === "register" && (
            <p style={switchText}>
              Already have an account? <span style={switchLink} onClick={() => { setMode("login"); setError(""); }}>Login</span>
            </p>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <p style={linkText} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Back to Login</p>
          )}
        </div>

      </form>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const container = {
  minHeight: "100vh",
  width: "100vw",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite"
};

const card = {
  background: "rgba(255, 255, 255, 0.8)", // More transparent matching glassmorphism
  backdropFilter: "blur(20px)",
  padding: "40px",
  borderRadius: "24px",
  width: "90%",           // Changed from fixed 380px to relative
  maxWidth: "400px",      // Cap width at 400px
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  position: "relative",
  zIndex: 2
};

const title = {
  textAlign: "center",
  marginBottom: "8px",
  color: "#be185d",
  fontSize: "32px",
  fontWeight: "800",
  textShadow: "0px 2px 2px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: "16px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "2px solid transparent",
  fontSize: "15px",
  color: "#333",
  background: "rgba(255,255,255,0.9)",
  boxSizing: "border-box",
  transition: "all 0.3s",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)"
};

const passwordInput = {
  ...input,
  paddingRight: "40px"
};

const button = {
  width: "100%",
  padding: "16px",
  background: "linear-gradient(to right, #ec4899, #be185d)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)"
};

const switchText = {
  marginTop: "16px",
  fontSize: "14px",
  color: "#4b5563"
};

const switchLink = {
  color: "#be185d",
  cursor: "pointer",
  fontWeight: "700",
  marginLeft: "5px",
  textDecoration: "underline"
};

const linkText = {
  color: "#6b7280",
  fontSize: "14px",
  cursor: "pointer",
  textDecoration: "underline",
  marginBottom: "16px"
};

const errorStyle = {
  background: "rgba(254, 226, 226, 0.9)",
  color: "#991b1b",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "20px",
  textAlign: "center",
  fontSize: "14px",
  border: "1px solid #fecaca"
};

const successStyle = {
  background: "rgba(209, 250, 229, 0.9)",
  color: "#065f46",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "20px",
  textAlign: "center",
  fontSize: "14px",
  border: "1px solid #a7f3d0"
};

// Add GLOBAL STYLES for animation
const globalStyles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.auth-bg input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
}
.auth-bg button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
}
.fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

document.head.insertAdjacentHTML("beforeend", `<style>${globalStyles}</style>`);
