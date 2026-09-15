import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Sprout,
  Settings,
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  FileText,
  Sparkles,
} from "lucide-react";

function Navbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      {/* BRAND LOGO */}
      <Link to="/" className="brand">
        <div className="brand-icon-wrap">
          <Sprout size={22} className="sprout-icon" />
          <Sparkles size={13} className="brand-sparkle" />
        </div>
        <div className="brand-text-wrap">
          <span className="brand-title">SmartFarm</span>
          <span className="brand-tag">IoT SYSTEM</span>
        </div>
      </Link>

      {/* CENTER NAV LINKS */}
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          <HomeIcon size={16} />
          <span>Home</span>
          <span className="hover-dot" />
        </NavLink>

        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
          <span className="hover-dot" />
        </NavLink>

        <NavLink to="/control" className={({ isActive }) => (isActive ? "active" : "")}>
          <Settings size={16} />
          <span>Control Panel</span>
          <span className="hover-dot" />
        </NavLink>

        <NavLink to="/report" className={({ isActive }) => (isActive ? "active" : "")}>
          <FileText size={16} />
          <span>Report</span>
          <span className="hover-dot" />
        </NavLink>

        <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
          <Info size={16} />
          <span>About</span>
          <span className="hover-dot" />
        </NavLink>
      </div>

      {/* RIGHT STATUS WIDGET */}
      <div className="nav-right-widget">
        <div className="status-chip" title="Sistem IoT Terhubung & Real-Time">
          <span className="status-dot" />
          <span className="status-label">IoT Online</span>
          <span className="status-divider">•</span>
          <span className="status-clock">{time || "REALTIME"}</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;