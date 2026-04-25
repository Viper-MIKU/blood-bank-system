import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api, getAuthConfig } from "../lib/api";

const getSavedProfile = () => {
  try {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(() => getSavedProfile());
  const [notificationCount, setNotificationCount] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setNotificationCount(0);
      localStorage.removeItem("currentUser");
      return;
    }

    let ignore = false;

    const loadNavbarData = async () => {
      try {
        const profileResponse = await api.get("/me", getAuthConfig(token));

        if (!ignore) {
          setProfile(profileResponse.data);
          localStorage.setItem("currentUser", JSON.stringify(profileResponse.data));
        }
      } catch {
        if (!ignore) {
          setProfile(getSavedProfile());
        }
      }

      try {
        const notificationResponse = await api.get("/notifications", getAuthConfig(token));

        if (!ignore) {
          setNotificationCount(notificationResponse.data.length);
        }
      } catch {
        if (!ignore) {
          setNotificationCount(0);
        }
      }
    };

    loadNavbarData();

    return () => {
      ignore = true;
    };
  }, [location.pathname, token]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const navItems = useMemo(() => {
    if (!token) {
      return [
        { to: "/", label: "Home" },
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];
    }

    const items = [
      { to: "/", label: "Home" },
      { to: "/users", label: "Donors" },
      { to: "/requests", label: "Received Requests" },
      { to: "/sent-requests", label: "Sent Requests" },
      { to: "/notifications", label: notificationCount ? `Notifications (${notificationCount})` : "Notifications" },
      { to: "/profile", label: "Profile" },
    ];

    if (profile?.role === "admin") {
      items.push({ to: "/admin", label: "Admin" });
    }

    return items;
  }, [notificationCount, profile?.role, token]);

  const homeItem = navItems.find((item) => item.to === "/");
  const otherNavItems = navItems.filter((item) => item.to !== "/");

  return (
    <nav className={`navbar ${dark ? "dark" : ""} ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-left">
        <Link to="/" className="logo">
          BloodBank
        </Link>

        {homeItem ? (
          <div className="nav-home-block">
            <Link
              to="/"
              className={`home-pill ${isActive("/") ? "active" : ""}`}
            >
              {homeItem.label}
            </Link>
            <span className="nav-divider" aria-hidden="true"></span>
            <span className="nav-group-label">Explore</span>
          </div>
        ) : null}
      </div>

      <div
        className={`menu-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`nav-links ${open ? "active" : ""}`}>
        <div className="nav-links-main">
          {otherNavItems.map((item) => (
            <Link
              className={isActive(item.to) ? "active" : ""}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {token && profile ? (
          <div className="nav-profile-pill">
            <span className="nav-profile-name">{profile.name}</span>
            <span className={`availability-badge availability-${profile.availability || "available"}`}>
              {profile.availability || "available"}
            </span>
          </div>
        ) : null}

        <button
          onClick={() => setDark(!dark)}
          className="theme-toggle"
          aria-label="Toggle theme"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? "☀" : "☾"}
        </button>

        {token ? (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
}
