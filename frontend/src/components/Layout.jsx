import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import CalendarView from "./CalendarView";
import Profile from "./Profile";
import Settings from "./Settings";
import Notifications from "./Notifications";

import API_URL from "../config";

export default function Layout({ setToken }) {
  const [page, setPage] = useState("calendar");
  const [notifications, setNotifications] = useState([]);
  const [calendarKey, setCalendarKey] = useState(0);

  // Fetch notifications for sidebar badge
  useEffect(() => {
    const fetchNotify = async () => {
      try {
        const token = localStorage.getItem("token");
        const [periodsRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/api/periods`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/auth/settings`, { headers: { Authorization: token } })
        ]);

        // Simple logic check for immediate upcoming period (same as Notifications component)
        const dates = periodsRes.data.map(d => d.start_date).sort();
        if (dates.length >= 2) {
          // We could duplicate logic or just generic count. 
          // For now let's set a dummy count if prediction exists
          setNotifications([1]);
        }
      } catch (e) {
        // quiet fail
      }
    };
    fetchNotify();
  }, [page]);

  const openCalendar = () => {
    setCalendarKey(prev => prev + 1); // force remount
    setPage("calendar");
  };

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        setToken={setToken}
        openCalendar={openCalendar}
        notificationCount={notifications.length}
      />

      <div className="main">
        {page === "calendar" && (
          <CalendarView key={calendarKey} />
        )}
        {page === "notifications" && (
          <Notifications />
        )}
        {page === "profile" && <Profile />}
        {page === "settings" && <Settings />}
      </div>
    </div>
  );
}
