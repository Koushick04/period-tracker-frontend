import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../config";

export default function Profile({ onNameUpdate }) {
  const [formData, setFormData] = useState({
    display_name: "",
    avatar: "👩"
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: token }
      })
      .then(res => setFormData({
        display_name: res.data.display_name || "",
        avatar: res.data.avatar || "👩"
      }))
      .catch(() => { });
  }, []);

  const handleSave = () => {
    setStatus("Saving...");
    const token = localStorage.getItem("token");
    axios.put(
      `${API_URL}/api/auth/profile`,
      formData,
      { headers: { Authorization: token } }
    ).then(() => {
      setStatus("Saved!");
      // Instant update sidebar
      if (onNameUpdate) onNameUpdate(formData.display_name);
      setTimeout(() => setStatus(""), 2000);
    }).catch(err => {
      console.error(err);
      setStatus("Error saving");
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={card}>
      <h2 style={{ color: "#db2777" }}>Profile</h2>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={formData.avatar || "https://i.pravatar.cc/150"}
          alt="avatar"
          style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "2px solid #db2777" }}
          onError={(e) => e.target.src = "https://i.pravatar.cc/150"}
        />
      </div>

      <input
        name="display_name"
        placeholder="Display Name"
        value={formData.display_name}
        onChange={handleChange}
        style={input}
      />

      <input
        name="avatar"
        placeholder="Avatar URL"
        value={formData.avatar}
        onChange={handleChange}
        style={input}
      />

      <button id="save-profile-btn" style={btn} onClick={handleSave}>
        {status === "Saving..." ? "Saving..." : "Save Profile"}
      </button>

      {status && status !== "Saving..." && (
        <p style={{ marginTop: "10px", textAlign: "center", color: "#059669", fontWeight: "600" }}>
          {status}
        </p>
      )}
    </div>
  );
}

const card = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  maxWidth: "400px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd"
};

const btn = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#db2777",
  color: "white",
  cursor: "pointer",
  fontWeight: "600"
};
