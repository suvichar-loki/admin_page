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
import { Uploader } from "./pages/ImagesPage";
import { ImagesListPage } from "./pages/ImageListPage";

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

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>Skywalker</h2>}
        <button className="collapse-btn" onClick={onToggle}>
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <ul>
        <li className={location.pathname.startsWith("/config") ? "active" : ""}>
          <Link to="/config">
            ⚙️ {!collapsed && "Config"}
          </Link>
        </li>
        <li className={location.pathname.startsWith("/upload") ? "active" : ""}>
          <Link to="/upload">
            🖼️ {!collapsed && "Upload"}
          </Link>
        </li>
        <li className={location.pathname.startsWith("/images") ? "active" : ""}>
          <Link to="/images">
            🖼️ {!collapsed && "Images"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}


function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="main">
        <AdminKeyBar />
        <div className="content">
          <Routes>
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/upload" element={<Uploader />} />
            <Route path="/images" element={<ImagesListPage />} />
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
