import axios from "axios";
import { useEffect, useState } from "react";

// Define API URL
import API_URL from "../config";

export default function Sidebar({
  page,
  setPage,
  setToken,
  openCalendar,
  notificationCount
}) {
  const [userName, setUserName] = useState("User");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: token }
        });
        if (res.data.display_name) setUserName(res.data.display_name);
      } catch (e) { /* ignore */ }
    };
    fetchName();
  }, []); // Run once on mount

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setToken(null);
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ margin: 0 }}>Period Tracker</h2>
          <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#db2777', fontWeight: '500' }}>Hi, {userName}</p>
        </div>

        <ul className="sidebar-nav">
          <li
            className={`nav-item ${page === "calendar" ? "active" : ""}`}
            onClick={openCalendar}
          >
            <span className="nav-icon">📅</span> Calendar
          </li>
          <li
            className={`nav-item ${page === "notifications" ? "active" : ""}`}
            onClick={() => setPage("notifications")}
          >
            <span className="nav-icon">🔔</span> Notifications
            {notificationCount > 0 && <span className="nav-badge">{notificationCount}</span>}
          </li>
          <li
            className={`nav-item ${page === "profile" ? "active" : ""}`}
            onClick={() => setPage("profile")}
          >
            <span className="nav-icon">👤</span> Profile
          </li>
          <li
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => setPage("settings")}
          >
            <span className="nav-icon">⚙️</span> Settings
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h3 style={{ color: "#db2777", margin: "0 0 10px 0" }}>Log Out?</h3>
            <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
              Are you sure you want to end your session?
            </p>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
