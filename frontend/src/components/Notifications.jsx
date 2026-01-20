import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../config";

export default function Notifications() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [periodsRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/api/periods`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/auth/settings`, { headers: { Authorization: token } })
        ]);

        const dates = periodsRes.data.map(d => d.start_date).sort();
        const settings = settingsRes.data;
        const notifyDays = settings.notify_days || 3;

        if (dates.length >= 2) {
          // Simple logic: Calc average, find last date, predict next
          const timestamps = dates.map(d => new Date(d).getTime());
          let diffs = 0;
          for (let i = 1; i < timestamps.length; i++) diffs += (timestamps[i] - timestamps[i - 1]);
          const avg = Math.round(diffs / (dates.length - 1) / (1000 * 3600 * 24));

          const lastDate = new Date(dates[dates.length - 1]);
          const nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + avg);

          const today = new Date();
          const timeDiff = nextDate - today;
          const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

          const reminderDate = new Date(nextDate);
          reminderDate.setDate(nextDate.getDate() - notifyDays);

          setReminders([
            {
              title: "Next Period Prediction",
              message: `Expected around ${nextDate.toLocaleDateString('en-GB')} (${daysUntil} days left)`
            },
            {
              title: "Period Reminder",
              message: `We'll remind you on ${reminderDate.toLocaleDateString('en-GB')} (${notifyDays} days before)`
            }
          ]);
        } else {
          setReminders([{ title: "Not Enough Data", message: "Log at least 2 periods to get predictions." }]);
        }

      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={card}>
      <h2 style={{ color: "#db2777" }}>Notifications</h2>

      {reminders.length === 0 ? (
        <p style={{ color: "#333" }}>Loading...</p>
      ) : (
        reminders.map((n, i) => (
          <div key={i} style={item}>
            <div style={{ fontWeight: "600", color: "#333" }}>{n.title}</div>
            <div style={{ fontSize: "14px", color: "#555" }}>
              {n.message}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const card = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  maxWidth: "500px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
};

const item = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  marginBottom: "10px"
};
