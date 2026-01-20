import { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return token ? (
    <Dashboard setToken={setToken} />
  ) : (
    <Auth setToken={setToken} />
  );
}
