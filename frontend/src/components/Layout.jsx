import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import CalendarView from "./CalendarView";
import Profile from "./Profile";
import Settings from "./Settings";
import Notifications from "./Notifications";
import Health from "./Health";

import API_URL from "../config";

export default function Layout({ setToken }) {
  const [page, setPage] = useState("calendar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [notifications, setNotifications] = useState([]);
  const [calendarKey, setCalendarKey] = useState(0);
  const [userName, setUserName] = useState("User");
  const [periods, setPeriods] = useState([]); // Lifted state

  // Fetch notifications & user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [periodsRes, settingsRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/periods`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/auth/settings`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/auth/profile`, { headers: { Authorization: token } })
        ]);

        // Store Period Data
        setPeriods(periodsRes.data);

        // Notifications logic
        const dates = periodsRes.data.map(d => d.start_date).sort();
        if (dates.length >= 2) {
          setNotifications([1]);
        }

        // Profile logic
        if (profileRes.data.display_name) {
          setUserName(profileRes.data.display_name);
        }

      } catch (e) {
        // quiet fail
      }
    };
    fetchData();
  }, [page]);

  const openCalendar = () => {
    setCalendarKey(prev => prev + 1); // force remount
    setCalendarKey(prev => prev + 1); // force remount
    setPage("calendar");
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  return (
    <div className="app-layout">
      <button
        className="mobile-menu-btn"
        onClick={() => setIsSidebarOpen(true)}
      >
        ☰
      </button>

      <Sidebar
        page={page}
        setPage={(p) => {
          setPage(p);
          setIsSidebarOpen(false); // Close on nav
        }}
        setToken={setToken}
        openCalendar={openCalendar}
        notificationCount={notifications.length}
        userName={userName}
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="main">
        {page === "calendar" && (
          <CalendarView
            key={calendarKey}
            periods={periods}
            refreshPeriods={() => {
              // Re-fetch only periods to update state
              const token = localStorage.getItem("token");
              axios.get(`${API_URL}/api/periods`, { headers: { Authorization: token } })
                .then(res => setPeriods(res.data))
                .catch(err => console.error(err));
            }}
          />
        )}
        {page === "notifications" && (
          <Notifications />
        )}
        {page === "health" && <Health />}
        {page === "profile" && <Profile onNameUpdate={setUserName} />}
        {page === "settings" && <Settings />}
      </div>
    </div>
  );
}
