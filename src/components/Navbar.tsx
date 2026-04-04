import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Navbar() {
  const [activeLink, setActiveLink] = useState("Home");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("STABLE");
  const [showNavbar, setShowNavbar] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Fleet", path: "/cars" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Update time and status
  useEffect(() => {
    const updateStream = () => {
      const now = new Date();
      const timeStr =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0");
      const states = ["STABLE", "FLUID", "AERATED", "CALM"];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setTime(timeStr);
      setStatus(randomState);
    };

    updateStream();
    const interval = setInterval(updateStream, 3000);
    return () => clearInterval(interval);
  }, []);

  // Set active link based on current path
  useEffect(() => {
    const current = navLinks.find((link) => link.path === location.pathname);
    if (current) setActiveLink(current.name);
  }, [location.pathname]);

  // Scroll detection to hide navbar on home page and login page
  useEffect(() => {
    // Hide navbar on login page
    if (location.pathname === "/login") {
      setShowNavbar(false);
      return;
    }

    const handleScroll = () => {
      // Only apply scroll hiding on home page
      if (location.pathname === "/") {
        const scrollPosition = window.scrollY;
        // Hide navbar after scrolling past 100px (roughly past hero)
        setShowNavbar(scrollPosition < 100);
      } else {
        // Always show navbar on other pages
        setShowNavbar(true);
      }
    };

    // Call once on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleLogout = () => signOut(auth);

  return (
    <>
      <style>{`
        :root {
          --transition-fluid: cubic-bezier(0.23, 1, 0.32, 1);
        }

        .nav-wrapper {
          position: fixed !important;
          top: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 9999 !important;
          display: flex !important;
          justify-content: center !important;
          width: auto !important;
          pointer-events: none !important;
          opacity: 1;
          transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), 
                      background-color 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      border-color 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      pointer-events 0.4s ease;
        }

        .nav-wrapper.hidden {
          opacity: 0;
          pointer-events: none !important;
        }

        .nav-wrapper > * {
          pointer-events: auto !important;
        }

        .porcelain-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: #fdfdfd;
          border-radius: 100px;
          box-shadow: 
            0 20px 40px -10px rgba(0, 0, 0, 0.1),
            0 10px 20px -5px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px 0 rgba(255,255,255,1), 
            inset 0 -2px 10px 0 rgba(0,0,0,0.02);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          gap: 20px;
          width: 100%;
          white-space: nowrap;
          transition: background-color 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      border-color 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .logo-section {
          padding-left: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .logo-mark {
          width: 14px;
          height: 14px;
          background: #1a1a1a;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.03);
          position: relative;
        }

        .logo-mark::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
        }

        .logo-text {
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 4px;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          text-decoration: none;
          color: rgba(0, 0, 0, 0.4);
          font-size: 15px;
          font-weight: 500;
          padding: 12px 24px;
          display: block;
          transition: color 0.4s var(--transition-fluid);
          position: relative;
          z-index: 2;
          cursor: pointer;
        }

        .fluid-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 40px;
          transform: scale(0.85);
          opacity: 0;
          transition: all 0.5s var(--transition-fluid);
          z-index: 1;
        }

        .nav-link:hover {
          color: #1a1a1a;
        }

        .nav-link:hover + .fluid-bg {
          transform: scale(1);
          opacity: 1;
        }

        .nav-link.active {
          color: #1a1a1a;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #1a1a1a;
          border-radius: 50%;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 0;
          flex-shrink: 0;
        }

        .data-stream {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.3);
          background: rgba(0, 0, 0, 0.04);
          padding: 6px 12px;
          border-radius: 40px;
          letter-spacing: -0.02em;
        }

        .action-button {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 40px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s var(--transition-fluid), box-shadow 0.3s var(--transition-fluid);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .action-button:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .action-button:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

      <div className={`nav-wrapper ${!showNavbar ? "hidden" : ""}`}>
        <nav className="porcelain-nav">
          <Link to="/" className="logo-section">
            <div className="logo-mark"></div>
            <span className="logo-text">DRiveX</span>
          </Link>

          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <Link
                  to={link.path}
                  className={`nav-link ${activeLink === link.name ? "active" : ""}`}
                  onMouseMove={(e) => {
                    const target = e.currentTarget;
                    const { offsetX, offsetY, clientWidth, clientHeight } = e.currentTarget as any;
                    const xPos = (offsetX / clientWidth) - 0.5;
                    const yPos = (offsetY / clientHeight) - 0.5;
                    target.style.transform = `translate(${xPos * 6}px, ${yPos * 4}px)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as any).style.transform = "translate(0, 0)";
                  }}
                >
                  {link.name}
                </Link>
                <div className="fluid-bg"></div>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {user ? (
              <button onClick={handleLogout} className="action-button">
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="action-button" style={{textDecoration: "none", display: "inline-block"}}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
