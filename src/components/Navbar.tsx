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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();

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

  const handleLogout = () => { signOut(auth); setShowUserMenu(false); };

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
          background: rgba(8, 10, 16, 0.88);
          border-radius: 100px;
          box-shadow:
            0 20px 48px -8px rgba(0,0,0,0.6),
            0 4px 16px -4px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          gap: 20px;
          width: 100%;
          white-space: nowrap;
          transition: background-color 0.6s cubic-bezier(0.23,1,0.32,1),
                      border-color 0.6s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.6s cubic-bezier(0.23,1,0.32,1);
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
          width: 12px;
          height: 12px;
          background: #00f2ff;
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          box-shadow: 0 0 8px rgba(0,242,255,0.5);
        }

        .logo-text {
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f0f2f5;
          font-weight: 700;
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
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          font-weight: 500;
          padding: 10px 20px;
          display: block;
          transition: color 0.3s var(--transition-fluid);
          position: relative;
          z-index: 2;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
        }

        .fluid-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.05);
          border-radius: 40px;
          transform: scale(0.85);
          opacity: 0;
          transition: all 0.4s var(--transition-fluid);
          z-index: 1;
        }

        .nav-link:hover { color: #f0f2f5; }
        .nav-link:hover + .fluid-bg { transform: scale(1); opacity: 1; }
        .nav-link.active { color: #ffffff; font-weight: 600; }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px;
          background: #00f2ff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,242,255,0.8);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 0;
          flex-shrink: 0;
        }

        .data-stream {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 5px 11px;
          border-radius: 40px;
          letter-spacing: 0.04em;
        }

        /* ── Avatar Trigger ── */
        .user-menu-wrapper {
          position: relative;
        }

        .avatar-trigger {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent, rgba(255,255,255,0.18));
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: none;
          outline: none;
        }

        .avatar-trigger:hover {
          transform: scale(1.08) rotate(-2deg);
        }

        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
        }

        .avatar-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .avatar-status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: #00ffaa;
          border: 2px solid #f0f0f0;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0,255,170,0.6);
        }

        /* ── Silica Dropdown ── */
        .silica-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          left: 0;
          width: 280px;
          background: rgba(10, 12, 18, 0.92);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 2px;
          padding: 8px;
          z-index: 9999;
          box-shadow: 0 24px 48px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06);
          animation: silicaIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
          transform-origin: top left;
          overflow: hidden;
        }

        @keyframes silicaIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Chromatic aberration edge */
        .silica-dropdown::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          background: linear-gradient(135deg,
            transparent 45%,
            rgba(0,240,255,0.6) 49%,
            rgba(255,0,212,0.6) 51%,
            transparent 55%);
          background-size: 300% 300%;
          z-index: -1;
          opacity: 0.15;
          pointer-events: none;
        }

        /* Glass shine sweep */
        .silica-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(125deg,
            transparent 0%, transparent 40%,
            rgba(255,255,255,0.07) 45%,
            rgba(255,255,255,0.1) 50%,
            transparent 55%, transparent 100%);
          background-size: 200% 200%;
          pointer-events: none;
          animation: shineSweep 8s infinite linear;
        }

        @keyframes shineSweep {
          0%   { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }

        /* User header */
        .silica-user-header {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 6px;
        }

        .silica-user-name {
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          display: block;
          font-family: 'Outfit', sans-serif;
        }

        .silica-user-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #94a3b8;
          margin-top: 3px;
          display: block;
          letter-spacing: -0.02em;
        }

        /* Nav items */
        .silica-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          text-decoration: none;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 2px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
        }

        .silica-nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 0;
          background: rgba(0,240,255,0.9);
          transition: height 0.25s ease;
        }

        .silica-nav-item:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.03);
        }

        .silica-nav-item:hover::before { height: 55%; }

        .silica-nav-icon-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .silica-nav-item svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.5;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), color 0.25s ease;
        }

        .silica-nav-item:hover svg {
          transform: translateX(3px);
          color: rgba(0,240,255,0.9);
        }

        .silica-shortcut {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          opacity: 0.35;
          border: 1px solid currentColor;
          padding: 1px 4px;
          border-radius: 2px;
        }

        .silica-danger {
          color: rgba(255,100,100,0.7) !important;
        }

        .silica-danger:hover {
          color: #ff6b6b !important;
          background: rgba(255,60,60,0.06) !important;
        }

        .silica-danger:hover::before {
          background: rgba(255,100,100,0.8) !important;
        }

        /* Footer */
        .silica-footer {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .silica-footer-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7.5px;
          color: #94a3b8;
          opacity: 0.45;
          letter-spacing: 0.05em;
        }

        .silica-footer-dot {
          width: 4px;
          height: 4px;
          background: rgba(0,240,255,0.9);
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(0,240,255,0.7);
        }

        /* Sign-in button */
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
          text-decoration: none;
          display: inline-block;
        }

        .action-button:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .action-button:active {
          transform: translateY(0) scale(0.98);
        }

        .mobile-obsidian-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .nav-wrapper {
            display: none !important;
          }
          
          .mobile-obsidian-nav {
            display: flex;
            position: fixed;
            bottom: 24px;
            left: 16px;
            right: 16px;
            background: #121214;
            height: 84px;
            border-radius: 28px;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.6),
                inset 0 1px 1px rgba(255, 255, 255, 0.08),
                inset 0 -1px 1px rgba(0,0,0,0.5);
            border: 1px solid rgba(0, 0, 0, 0.5);
            z-index: 9999;
            animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            backdrop-filter: blur(20px);
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .mob-nav-item {
            position: relative;
            flex: 1;
            height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .mob-nav-item:active { transform: scale(0.92); }
          
          .mob-icon-wrap {
            width: 28px; height: 28px; position: relative;
            display: flex; align-items: center; justify-content: center;
          }
          
          .mob-icon-wrap svg {
            width: 20px; height: 20px; fill: none;
            stroke: #64748b; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.8));
          }
          
          .mob-nav-item.active .mob-icon-wrap svg {
            stroke: #00f2ff;
            filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.4));
            transform: translateY(-2px);
          }
          
          .mob-label {
            font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 4px;
            opacity: 0.6; transition: all 0.3s ease; text-decoration: none;
          }
          
          .mob-nav-item.active .mob-label { color: #00f2ff; opacity: 1; }
          
          .mob-avatar-recess {
            width: 52px; height: 52px; background: #0a0a0c; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: inset 2px 2px 5px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255,255,255,0.03);
            margin: 0 10px; position: relative; text-decoration: none;
          }
          
          .mob-avatar-recess::after {
            content: ''; position: absolute; inset: -4px; border-radius: 50%;
            background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.2) 100%);
            pointer-events: none;
          }
          
          .mob-avatar-img, .mob-avatar-text {
            width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
            border: 1px solid rgba(255,255,255,0.1); filter: grayscale(0.2) contrast(1.1);
            transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            display: flex; align-items: center; justify-content: center;
            background: #111; color: #fff; font-family: 'Outfit'; font-size: 14px; font-weight: bold;
          }
          
          .mob-avatar-recess:active .mob-avatar-img, .mob-avatar-recess:active .mob-avatar-text {
            transform: scale(1.05) rotate(5deg);
          }
          
          .mob-active-pill {
            position: absolute; bottom: -10px; width: 4px; height: 4px; background: #00f2ff;
            border-radius: 50%; box-shadow: 0 0 10px #00f2ff, 0 0 20px #00f2ff;
            opacity: 0; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .mob-nav-item.active .mob-active-pill { opacity: 1; bottom: 6px; }
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
              <div className="user-menu-wrapper">
                {/* Avatar Trigger */}
                <button
                  className="avatar-trigger"
                  onClick={() => setShowUserMenu(v => !v)}
                  aria-label="User menu"
                >
                  <div className="avatar-inner">
                    {profile?.photoURL
                      ? <img src={profile.photoURL} alt="avatar" referrerPolicy="no-referrer" />
                      : (profile?.displayName?.[0] || user.email?.[0] || "U").toUpperCase()
                    }
                  </div>
                  <div className="avatar-status-dot" />
                </button>

                {/* Silica Dropdown */}
                {showUserMenu && (
                  <div
                    className="silica-dropdown"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const xR = ((y - rect.height / 2) / rect.height) * 4;
                      const yR = ((x - rect.width / 2) / rect.width) * -4;
                      e.currentTarget.style.transform = `perspective(900px) rotateX(${xR}deg) rotateY(${yR}deg)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
                    }}
                  >
                    <div className="silica-shine" />

                    {/* User header */}
                    <div className="silica-user-header">
                      <span className="silica-user-name">
                        {profile?.displayName || user.email?.split("@")[0] || "User"}
                      </span>
                      <span className="silica-user-id">
                        DRIVEX_OS // {user.uid.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Dashboard */}
                    <Link
                      to="/dashboard"
                      className="silica-nav-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="silica-nav-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>Dashboard</span>
                      </div>
                      <span className="silica-shortcut">⌘ D</span>
                    </Link>

                    {/* Admin Panel — only for admin */}
                    {profile?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="silica-nav-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="silica-nav-icon-wrap">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                          <span>Admin Panel</span>
                        </div>
                        <span className="silica-shortcut">⌘ A</span>
                      </Link>
                    )}

                    {/* Sign Out */}
                    <button
                      className="silica-nav-item silica-danger"
                      onClick={handleLogout}
                    >
                      <div className="silica-nav-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>

                    {/* Footer */}
                    <div className="silica-footer">
                      <span className="silica-footer-text">L-SYSTEM STATUS: OPTIMAL</span>
                      <div className="silica-footer-dot" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-button">Sign In</Link>
            )}
          </div>
        </nav>
      </div>

      {/* ── MOBILE NAV: ETCHED RELIEF ── */}
      <nav className="mobile-obsidian-nav">
        <Link to="/" className={`mob-nav-item ${activeLink === "Home" ? "active" : ""}`}>
          <div className="mob-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span className="mob-label">Index</span>
          <div className="mob-active-pill"></div>
        </Link>
        <Link to="/cars" className={`mob-nav-item ${activeLink === "Fleet" ? "active" : ""}`}>
          <div className="mob-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <span className="mob-label">Fleet</span>
          <div className="mob-active-pill"></div>
        </Link>
        
        <Link to={user ? (profile?.role === "admin" ? "/admin" : "/dashboard") : "/login"} className="mob-avatar-recess">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Avatar" className="mob-avatar-img" />
          ) : (
            <div className="mob-avatar-text">
              {(profile?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
          )}
        </Link>

        <Link to="/about" className={`mob-nav-item ${activeLink === "About" ? "active" : ""}`}>
          <div className="mob-icon-wrap">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </div>
          <span className="mob-label">About</span>
          <div className="mob-active-pill"></div>
        </Link>
        
        <Link to="/contact" className={`mob-nav-item ${activeLink === "Contact" ? "active" : ""}`}>
          <div className="mob-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
          </div>
          <span className="mob-label">Comms</span>
          <div className="mob-active-pill"></div>
        </Link>
      </nav>
    </>
  );
}
