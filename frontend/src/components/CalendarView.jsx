import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import axios from "axios";

/* ---------------- HELPERS ---------------- */

function calculateAverageCycle(dates) {
  if (dates.length < 2) return null;
  const sorted = dates.map(d => new Date(d)).sort((a, b) => a - b);
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
  }
  return Math.round(total / (sorted.length - 1));
}

function predictNextDate(dates, avg) {
  if (!avg || dates.length === 0) return null;
  const last = new Date(dates.sort().slice(-1)[0]);
  last.setDate(last.getDate() + avg);
  return last;
}

function buildPredictionWindow(predicted) {
  const days = [];
  for (let i = -3; i <= 1; i++) {
    const d = new Date(predicted);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

/* ---------------- COMPONENT ---------------- */

import API_URL from "../config";

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [periodDates, setPeriodDates] = useState([]);
  const [average, setAverage] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null); // modal
  const token = localStorage.getItem("token");

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load saved data
  useEffect(() => {
    axios
      .get(`${API_URL}/api/periods`, {
        headers: { Authorization: token }
      })
      .then(res => {
        // Normalize backend dates to YYYY-MM-DD strings
        const dates = res.data.map(d => new Date(d.start_date).toISOString().split("T")[0]);
        rebuildCalendar(dates);
      });
  }, []);

  // Build calendar safely
  function rebuildCalendar(dates) {
    // Ensure we work with unique sorted strings
    const uniqueDates = Array.from(new Set(dates)).sort();
    setPeriodDates(uniqueDates);

    const avg = calculateAverageCycle(uniqueDates);
    const predicted = predictNextDate(uniqueDates, avg);

    let newEvents = uniqueDates.map(d => ({
      title: "Period",
      start: d,
      allDay: true, // Fixes "12a" issue
      color: "#db2777"
    }));

    if (predicted) {
      const windowDays = buildPredictionWindow(predicted);
      windowDays.forEach(day => {
        newEvents.push({
          start: day,
          display: "background",
          allDay: true,
          backgroundColor: "#fbcfe8"
        });
      });

      newEvents.push({
        title: "Predicted",
        start: predicted.toISOString().split("T")[0],
        allDay: true,
        color: "#fb7185"
      });

      setNextPeriod(predicted.toISOString().split("T")[0]);
    } else {
      setNextPeriod(null);
    }

    setAverage(avg);
    setEvents(newEvents);
  }

  // Click date → open in-app modal
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr); // info.dateStr is YYYY-MM-DD
  };

  // CONFIRM ADD
  const confirmAdd = () => {
    if (periodDates.includes(selectedDate)) return; // Prevent duplicates

    const updated = [...periodDates, selectedDate];
    rebuildCalendar(updated);

    axios.post(
      `${API_URL}/api/periods`,
      { date: selectedDate },
      { headers: { Authorization: token } }
    );

    setSelectedDate(null);
  };

  // DELETE DATE
  const deleteDate = () => {
    const updated = periodDates.filter(d => d !== selectedDate);
    rebuildCalendar(updated);

    axios.delete(
      `${API_URL}/api/periods`,
      {
        headers: { Authorization: token },
        data: { date: selectedDate } // Correct axios delete body syntax
      }
    );

    setSelectedDate(null);
  };

  // CLEAR ALL (Open Modal)
  const openClearModal = () => {
    setShowClearConfirm(true);
  };

  // CONFIRM CLEAR ALL
  const confirmClearAll = () => {
    setPeriodDates([]);
    setEvents([]);
    setAverage(null);
    setNextPeriod(null);
    setShowClearConfirm(false);

    axios.delete(`${API_URL}/api/periods/all`, {
      headers: { Authorization: token }
    });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {/* INFO CARDS */}
        <div style={{ display: "flex", gap: "20px", flex: 1 }}>
          <InfoCard title="Average Cycle" value={average ? `${average} days` : "—"} />
          <InfoCard title="Next Period" value={nextPeriod ? nextPeriod.split('-').reverse().join('/') : "—"} pink />
        </div>

        <button style={dangerBtn} onClick={openClearModal}>Clear All</button>
      </div>

      {/* CALENDAR */}
      <div style={calendarStyle}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          events={events}
          height="auto"
        />
      </div>

      {/* IN-APP MODAL (Add/Delete/Clear) */}
      {selectedDate && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ color: "#db2777" }}>
              {selectedDate.split('-').reverse().join('/')}
            </h3>

            {!periodDates.includes(selectedDate) ? (
              <>
                <p>Mark this as period start?</p>
                <button style={primaryBtn} onClick={confirmAdd}>Confirm</button>
              </>
            ) : (
              <>
                <p>This date is already marked.</p>
                <button style={dangerBtn} onClick={deleteDate}>Remove</button>
              </>
            )}

            <button style={secondaryBtn} onClick={() => setSelectedDate(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CLEAR CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ color: "#ef4444" }}>Clear All Data?</h3>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Are you sure you want to delete all entries? This cannot be undone.
            </p>
            <button style={dangerBtn} onClick={confirmClearAll}>Yes, Delete All</button>
            <button style={secondaryBtn} onClick={() => setShowClearConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function InfoCard({ title, value, pink }) {
  return (
    <div style={{
      flex: 1,
      background: "white",
      padding: "16px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
    }}>
      <h4 style={{ color: pink ? "#fb7185" : "#db2777" }}>{title}</h4>
      <p style={{ fontSize: "18px", color: "#333", fontWeight: "600" }}>{value}</p>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const calendarStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
};

const overlay = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  width: "300px",
  textAlign: "center"
};

const primaryBtn = {
  width: "100%",
  padding: "10px",
  background: "#db2777",
  color: "white",
  border: "none",
  borderRadius: "10px",
  marginBottom: "10px"
};

const dangerBtn = {
  padding: "10px 20px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryBtn = {
  width: "100%",
  padding: "10px",
  background: "#f3f4f6",
  color: "#333",
  border: "none",
  borderRadius: "10px",
  fontWeight: "500"
};
