import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { calculateAverageCycle } from "../utils/cycleHelper";

export default function Health() {
    const [status, setStatus] = useState("Loading...");
    const [avg, setAvg] = useState(null);
    const [color, setColor] = useState("#666");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_URL}/api/periods`, {
                    headers: { Authorization: token }
                });

                const dates = res.data.map(d => d.start_date);

                if (dates.length < 2) {
                    setStatus("Not Enough Data");
                    setMessage("Please log at least 2 periods to see your health analysis.");
                    setColor("#6b7280");
                    return;
                }

                const average = calculateAverageCycle(dates);
                setAvg(average);

                if (average < 21) {
                    setStatus("Cycle Too Short (Critical)");
                    setMessage("Your cycle is shorter than 21 days. This can be a sign of a health issue. Please consult a doctor.");
                    setColor("#ef4444"); // Red
                } else if (average > 40) {
                    setStatus("Cycle Too Long (Warning)");
                    setMessage("Your cycle is longer than 40 days. Irregular cycles might indicate an underlying condition.");
                    setColor("#f59e0b"); // Orange/Amber
                } else {
                    setStatus("Healthy Cycle (Normal)");
                    setMessage("Your cycle length is within the normal range (21-35 days). Keep tracking!");
                    setColor("#10b981"); // Green
                }

            } catch (e) {
                console.error(e);
                setStatus("Error loading data");
            }
        };
        fetchData();
    }, []);

    return (
        <div style={container}>
            <h2 style={{ color: "#db2777", marginBottom: "24px" }}>Health Insights</h2>

            <div style={card}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Cycle Analysis</h3>

                <div style={{ ...statusBox, borderColor: color, backgroundColor: `${color}10` }}>
                    <h1 style={{ color: color, margin: "0" }}>{avg ? `${avg} Days` : "—"}</h1>
                    <p style={{ fontWeight: "600", color: color, marginTop: "4px" }}>{status}</p>
                </div>

                <p style={{ marginTop: "20px", lineHeight: "1.6", color: "#555" }}>
                    {message}
                </p>

                <div style={legend}>
                    <div style={legendItem}><span style={{ ...dot, background: "#ef4444" }}></span> &lt; 21 Days (Short)</div>
                    <div style={legendItem}><span style={{ ...dot, background: "#10b981" }}></span> 21-35 Days (Normal)</div>
                    <div style={legendItem}><span style={{ ...dot, background: "#f59e0b" }}></span> &gt; 40 Days (Long)</div>
                </div>
            </div>
        </div>
    );
}

const container = {
    padding: "20px",
    maxWidth: "600px"
};

const card = {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
};

const statusBox = {
    border: "2px solid",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    marginTop: "20px"
};

const legend = {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: "#666"
};

const legendItem = {
    display: "flex",
    alignItems: "center",
    gap: "6px"
};

const dot = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block"
};
