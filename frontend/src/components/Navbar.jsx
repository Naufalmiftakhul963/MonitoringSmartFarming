import { NavLink } from "react-router-dom";
import {
  Sprout,
  Settings,
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  FileText,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <div className="brand-icon-wrap">
          <Sprout size={22} />
        </div>
        <span>SmartFarm</span>
      </div>

      <div className="nav-links">
        <NavLink to="/">
          <HomeIcon size={16} />
          Home
        </NavLink>

        <NavLink to="/dashboard">
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/control">
          <Settings size={16} />
          Control Panel
        </NavLink>

        <NavLink to="/report">
          <FileText size={16} />
          Report
        </NavLink>

        <NavLink to="/about">
          <Info size={16} />
          About
        </NavLink>
      </div>

      <div className="nav-live">
        <span className="nav-live-dot" />
        <span className="nav-live-txt">Live</span>
      </div>
    </nav>
  );
}

export default Navbar;