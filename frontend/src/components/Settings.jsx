import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../config";

export default function Settings() {
  const [formData, setFormData] = useState({
    cycle_override: "",
    notify_days: 3
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/auth/settings`, {
        headers: { Authorization: token }
      })
      .then(res => {
        setFormData({
          cycle_override: res.data.cycle_override || "",
          notify_days: res.data.notify_days || 3
        });
      })
      .catch(() => { });
  }, []);

  const handleSave = () => {
    const token = localStorage.getItem("token");
    axios.put(
      `${API_URL}/api/auth/settings`,
      {
        cycle_override: formData.cycle_override ? Number(formData.cycle_override) : null,
        notify_days: formData.notify_days
      },
      { headers: { Authorization: token } }
    ).then(() => {
      setStatus("Saved!");
      setTimeout(() => setStatus(""), 2000);
    });
  };

  return (
    <div style={card}>
      <h2 style={{ color: "#db2777" }}>Settings</h2>

      {/* Cycle Override */}
      <label style={label}>Cycle Length (days)</label>
      <input
        type="number"
        placeholder="Auto (use average)"
        value={formData.cycle_override}
        onChange={e => setFormData({ ...formData, cycle_override: e.target.value })}
        style={input}
      />
      <p style={hint}>
        Leave empty to use automatically calculated cycle
      </p>

      {/* Notification Days */}
      <label style={label}>Notify Before (days)</label>
      <select
        value={formData.notify_days}
        onChange={e => setFormData({ ...formData, notify_days: Number(e.target.value) })}
        style={input}
      >
        {[1, 2, 3, 4, 5].map(d => (
          <option key={d} value={d}>
            {d} day{d > 1 ? "s" : ""}
          </option>
        ))}
      </select>

      <button style={btn} onClick={handleSave}>
        Save Settings
      </button>

      {status && <p style={{ marginTop: "10px", textAlign: "center", color: "#059669", fontWeight: "600" }}>{status}</p>}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const card = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  maxWidth: "420px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  color: "#333", // Ensure text is visible
  fontSize: "15px"
};

const label = {
  fontWeight: "600",
  marginTop: "10px",
  display: "block",
  color: "#333" // Darker text
};

const hint = {
  fontSize: "13px",
  color: "#555", // Darker gray
  marginBottom: "16px"
};

const btn = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#db2777",
  color: "white"
};
