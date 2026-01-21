import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

export default function App() {
  // 1. Force state to NULL on initial load (Refresh = Logout)
  const [token, setToken] = useState(null);

  // 2. Clear any stored token immediately on mount
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  return token ? (
    <Dashboard setToken={setToken} />
  ) : (
    <Auth setToken={setToken} />
  );
}
