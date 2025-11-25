// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import "./index.css";
import { useState } from "react";
import {
  getAdminClientKey,
  setAdminClientKey,
  clearAdminClientKey,
} from "./api";
import { ConfigPage } from "./pages/ConfigPage";
import { ImagesPage } from "./pages/ImagesPage";

function AdminKeyBar() {
  const [value, setValue] = useState(getAdminClientKey() || "");

  const handleSave = () => {
    setAdminClientKey(value.trim());
    // just visually confirm; you can add toast
    alert("Admin client key saved locally.");
  };

  const handleClear = () => {
    clearAdminClientKey();
    setValue("");
    alert("Admin client key cleared.");
  };

  return (
    <div className="admin-key-bar">
      <label>
        Admin Client Key:
        <input
          type="password"
          value={value}
          placeholder="X-Client-Key value"
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  return (
    <nav className="sidebar">
      <h2>Skywalker Admin</h2>
      <ul>
        <li className={location.pathname.startsWith("/config") ? "active" : ""}>
          <Link to="/config">Config</Link>
        </li>
        <li className={location.pathname.startsWith("/images") ? "active" : ""}>
          <Link to="/images">Images</Link>
        </li>
      </ul>
    </nav>
  );
}

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <AdminKeyBar />
        <div className="content">
          <Routes>
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="*" element={<Navigate to="/config" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
