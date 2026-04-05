import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore";
import { updateProfile, signOut } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Booking } from "../types";
import { differenceInDays, parseISO, format } from "date-fns";
import { formatCurrency } from "../lib/utils";
import { Save, X, Edit2, LogOut, Camera } from "lucide-react";

const STATUS_DOT: Record<string, { bg: string; glow: string }> = {
  confirmed:  { bg: "#00fff0", glow: "#00fff0" },
  pending:    { bg: "#ff00c1", glow: "#ff00c1" },
  completed:  { bg: "#7000ff", glow: "#7000ff" },
  cancelled:  { bg: "#555",   glow: "transparent" },
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [page, setPage]   = useState(0);
  const PER_PAGE = 6;

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (!user && !profile) navigate("/login"); }, [user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      } catch (e) { console.error(e); }
      finally { setLoadingBookings(false); }
    })();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({ displayName: profile.displayName || "", phone: profile.phone || "" });
      setLocalPhotoURL(profile.photoURL || null);
    }
  }, [profile]);

  // Compress image to 200×200 JPEG base64 using canvas
  const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 200;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const base64 = await compressImage(file);
      await updateDoc(doc(db, "users", user.uid), { photoURL: base64 });
      await updateProfile(user, { photoURL: base64 });
      setLocalPhotoURL(base64);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Mouse parallax tilt
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (window.innerWidth  / 2 - e.pageX) / 60;
      const y = (window.innerHeight / 2 - e.pageY) / 60;
      if (panelRef.current)
        panelRef.current.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${-y}deg)`;
      if (ambientRef.current)
        ambientRef.current.style.transform = `translate(calc(-50% + ${x * 2}px), calc(-50% + ${y * 2}px))`;
    };
    const onLeave = () => {
      if (panelRef.current) panelRef.current.style.transform = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); };
  }, []);

  const saveProfile = async () => {
    if (!user) return; setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: profileForm.displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName: profileForm.displayName, phone: profileForm.phone });
      setEditing(false);
    } catch (e) { console.error(e); } finally { setSavingProfile(false); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  };

  if (!user) return null;

  const totalPages = Math.max(1, Math.ceil(bookings.length / PER_PAGE));
  const visibleBookings = bookings.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const firstName = profile?.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;800&family=JetBrains+Mono:wght@300;500&display=swap');

        .sv-page {
          min-height: 100vh;
          background: #030303;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 40px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* Ambient spectral glow */
        .sv-ambient {
          position: fixed;
          top: 50%; left: 50%;
          width: 80vw; height: 80vh;
          background: radial-gradient(circle, #7000ff 0%, transparent 70%);
          filter: blur(120px);
          opacity: 0.12;
          transform: translate(-50%, -50%);
          z-index: 0;
          animation: sv-pulse 10s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes sv-pulse {
          from { transform: translate(-50%, -50%) scale(1);   opacity: 0.08; }
          to   { transform: translate(-45%, -55%) scale(1.2); opacity: 0.18; }
        }

        /* Main panel */
        .sv-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1060px;
          height: auto;
          min-height: 640px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 50px 100px rgba(0,0,0,0.8);
          backdrop-filter: blur(40px);
          transition: transform 0.2s ease;
          animation: sv-entry 1s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes sv-entry {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Shimmer refraction overlay */
        .sv-refraction {
          position: absolute;
          inset: 0; z-index: 20;
          background: linear-gradient(135deg,
            transparent 0%,
            rgba(255,255,255,0.04) 40%,
            rgba(112,0,255,0.05) 50%,
            rgba(255,255,255,0.04) 60%,
            transparent 100%
          );
          background-size: 200% 200%;
          animation: sv-shimmer 9s linear infinite;
          pointer-events: none;
        }

        @keyframes sv-shimmer {
          0%   { background-position: -200% -200%; }
          100% { background-position: 200%  200%; }
        }

        /* ═══ SIDEBAR ═══ */
        .sv-sidebar {
          background: linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(0,0,0,0.3) 100%);
          padding: 44px 36px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .sv-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #ff00c1, transparent);
          opacity: 0.5;
        }

        /* Avatar */
        .sv-avatar-wrap {
          position: relative;
          width: 100px; height: 100px;
          margin-bottom: 32px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .sv-avatar-wrap:hover .sv-avatar-upload-hint { opacity: 1; }

        .sv-avatar-upload-hint {
          position: absolute;
          inset: 0; z-index: 10;
          background: rgba(0,0,0,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: 2px;
          color: #00fff0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sv-avatar-spinner {
          position: absolute;
          inset: 0; z-index: 10;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
        }

        @keyframes sv-spin { to { transform: rotate(360deg); } }
        .sv-spinner-ring {
          width: 28px; height: 28px;
          border: 2px solid rgba(0,255,240,0.15);
          border-top-color: #00fff0;
          border-radius: 50%;
          animation: sv-spin 0.7s linear infinite;
        }

        .sv-avatar-border {
          position: absolute;
          inset: -10px;
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 0;
        }

        .sv-avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 2px;
          filter: grayscale(1) contrast(1.1);
          display: block;
          position: relative;
          z-index: 1;
        }

        .sv-avatar-initial {
          width: 100%; height: 100%;
          background: rgba(112,0,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 800; color: rgba(255,255,255,0.6);
          border-radius: 2px; position: relative; z-index: 1;
          font-family: 'Inter', sans-serif;
        }

        .sv-avatar-overlay {
          position: absolute;
          inset: 0; z-index: 2;
          background: linear-gradient(45deg, #ff00c1, #00fff0);
          mix-blend-mode: overlay;
          opacity: 0.35;
          border-radius: 2px;
        }

        /* Name & handle */
        .sv-name {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          line-height: 1.05;
          color: #fff;
          margin-bottom: 6px;
        }

        .sv-handle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: #00fff0;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 36px;
        }

        /* Stats */
        .sv-stat { margin-bottom: 24px; }

        .sv-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 3px;
        }

        .sv-stat-value {
          font-size: 1rem;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
        }

        .sv-credit-value {
          font-family: 'JetBrains Mono', monospace;
          color: #00fff0;
          font-size: 1rem;
        }

        /* Sidebar buttons */
        .sv-glass-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          padding: 11px 20px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          margin-bottom: 10px;
          width: 100%;
          text-align: left;
        }

        .sv-glass-btn:hover {
          border-color: #00fff0;
          color: #00fff0;
          box-shadow: 0 0 18px rgba(0,255,240,0.15);
        }

        .sv-glass-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: 0.5s;
        }

        .sv-glass-btn:hover::after { left: 100%; }

        .sv-glass-btn.danger:hover {
          border-color: #ff00c1;
          color: #ff00c1;
          box-shadow: 0 0 18px rgba(255,0,193,0.15);
        }

        /* ═══ MAIN ═══ */
        .sv-main {
          background: rgba(0,0,0,0.25);
          padding: 44px 48px;
          display: flex;
          flex-direction: column;
        }

        .sv-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sv-section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        .sv-live-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          color: #ff00c1;
          letter-spacing: 0.1em;
        }

        /* ═══ BOOKING LIST ═══ */
        .sv-booking-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sv-booking-list::-webkit-scrollbar { display: none; }

        .sv-booking-item {
          display: grid;
          grid-template-columns: 70px 1fr 90px 90px;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.23,1,0.32,1);
          gap: 12px;
        }

        .sv-booking-item:hover {
          padding-left: 14px;
          background: linear-gradient(90deg, rgba(255,255,255,0.025), transparent);
        }

        .sv-booking-item:last-child { border-bottom: none; }

        .sv-bk-date {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.4;
        }

        .sv-bk-car { font-weight: 300; font-size: 0.95rem; color: rgba(255,255,255,0.85); }
        .sv-bk-sub { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: rgba(255,255,255,0.25); margin-top: 2px; }

        .sv-bk-price {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          text-align: right;
        }

        .sv-bk-status {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          color: rgba(255,255,255,0.5);
        }

        .sv-status-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sv-cancel-btn {
          display: block;
          margin-top: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ff00c1;
          background: transparent;
          border: none;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
          text-align: right;
          width: 100%;
        }
        .sv-cancel-btn:hover { opacity: 1; }

        /* Empty state */
        .sv-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: rgba(255,255,255,0.15);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sv-explore-link {
          display: inline-block;
          margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: #00fff0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,255,240,0.3);
          padding-bottom: 2px;
          transition: border-color 0.2s;
        }
        .sv-explore-link:hover { border-color: #00fff0; }

        /* ═══ FOOTER NAV ═══ */
        .sv-footer {
          margin-top: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 18px;
        }

        .sv-page-info {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.08em;
        }

        .sv-page-nav {
          display: flex;
          gap: 24px;
        }

        .sv-page-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: none; border: none;
          cursor: pointer;
          transition: color 0.2s;
          color: rgba(255,255,255,0.25);
        }

        .sv-page-btn:not(:disabled):hover { color: rgba(255,255,255,0.7); }
        .sv-page-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .sv-page-btn.active-next { color: #00fff0; }

        /* ═══ PROFILE PANEL (modal overlay inside) ═══ */
        .sv-profile-overlay {
          position: absolute;
          inset: 0; z-index: 100;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: sv-fade-in 0.3s ease;
        }

        @keyframes sv-fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }

        .sv-profile-box {
          background: #0a0a10;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 1px solid rgba(0,255,240,0.3);
          padding: 40px;
          width: 90%;
          max-width: 420px;
          position: relative;
        }

        .sv-profile-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 28px;
        }

        .sv-pf-field { margin-bottom: 20px; }

        .sv-pf-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.25);
          margin-bottom: 6px;
        }

        .sv-pf-value {
          font-size: 0.9rem;
          font-weight: 300;
          color: rgba(255,255,255,0.75);
        }

        .sv-pf-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 14px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          border-radius: 1px;
        }

        .sv-pf-input:focus { border-color: rgba(0,255,240,0.4); }
        .sv-pf-input::placeholder { color: rgba(255,255,255,0.15); font-size: 0.85rem; }

        .sv-pf-actions { display: flex; gap: 10px; margin-top: 28px; }

        .sv-pf-save {
          display: inline-flex; align-items: center; gap: 7px;
          background: #00fff0; border: none;
          color: #030303;
          padding: 10px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; border-radius: 1px;
          font-weight: 700;
        }
        .sv-pf-save:hover { background: #40ffff; box-shadow: 0 0 20px rgba(0,255,240,0.3); }
        .sv-pf-save:disabled { opacity: 0.4; cursor: wait; }

        .sv-pf-cancel {
          display: inline-flex; align-items: center; gap: 7px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          padding: 10px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; border-radius: 1px;
        }
        .sv-pf-cancel:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }

        /* Role badge */
        .sv-role-badge {
          display: inline-block;
          padding: 3px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(112,0,255,0.2);
          color: rgba(160,100,255,0.9);
          border: 1px solid rgba(112,0,255,0.3);
        }

        @media (max-width: 780px) {
          .sv-panel { grid-template-columns: 1fr; height: auto; }
          .sv-sidebar { padding: 32px 24px; }
          .sv-main { padding: 28px 24px; }
          .sv-booking-item { grid-template-columns: 60px 1fr 80px; }
          .sv-bk-status { display: none; }
          .sv-page { padding: 80px 12px 32px; }
        }
      `}</style>

      {/* Ambient */}
      <div className="sv-ambient" ref={ambientRef} />

      <div className="sv-page">
        <div className="sv-panel" ref={panelRef}>
          <div className="sv-refraction" />

          {/* ═══ SIDEBAR ═══ */}
          <aside className="sv-sidebar">

            {/* Avatar — clickable to change */}
            <div
              className="sv-avatar-wrap"
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              title="Click to change photo"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div className="sv-avatar-border" />
              {(localPhotoURL || profile?.photoURL)
                ? <><img className="sv-avatar-img" src={localPhotoURL || profile?.photoURL || ""} alt="avatar" referrerPolicy="no-referrer" /><div className="sv-avatar-overlay" /></>
                : <><div className="sv-avatar-initial">{firstName[0]?.toUpperCase()}</div><div className="sv-avatar-overlay" /></>
              }
              {uploadingPhoto
                ? <div className="sv-avatar-spinner"><div className="sv-spinner-ring" /></div>
                : <div className="sv-avatar-upload-hint"><Camera size={16} /><span>Change</span></div>
              }
            </div>

            <h1 className="sv-name">{firstName}</h1>
            <p className="sv-handle">Ref: DX-{user.uid.slice(0, 6).toUpperCase()}</p>

            <div className="sv-stat">
              <div className="sv-stat-label">Email</div>
              <div className="sv-stat-value" style={{ fontSize: "0.82rem" }}>{user.email}</div>
            </div>

            <div className="sv-stat">
              <div className="sv-stat-label">Phone</div>
              <div className="sv-stat-value">{profile?.phone || "—"}</div>
            </div>

            <div className="sv-stat">
              <div className="sv-stat-label">Membership</div>
              <div className="sv-stat-value">
                <span className="sv-role-badge">{profile?.role || "user"}</span>
              </div>
            </div>

            <div className="sv-stat">
              <div className="sv-stat-label">Total Bookings</div>
              <div className="sv-credit-value">{String(bookings.length).padStart(2, "0")}</div>
            </div>

            <div style={{ marginTop: "auto" }}>
              <button className="sv-glass-btn" onClick={() => setShowProfile(true)}>
                Edit Identity
              </button>
              <button className="sv-glass-btn danger" onClick={() => { signOut(auth); navigate("/"); }}>
                <LogOut size={11} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* ═══ MAIN ═══ */}
          <main className="sv-main">
            <header className="sv-section-header">
              <h2 className="sv-section-title">Booking History</h2>
              <span className="sv-live-badge">
                {loadingBookings ? "Syncing…" : `${bookings.length} record${bookings.length !== 1 ? "s" : ""}`}
              </span>
            </header>

            {/* Booking list */}
            {loadingBookings ? (
              <div className="sv-empty">Loading…</div>
            ) : bookings.length === 0 ? (
              <div className="sv-empty">
                <div>No bookings found</div>
                <Link to="/cars" className="sv-explore-link">Explore Fleet →</Link>
              </div>
            ) : (
              <div className="sv-booking-list">
                {visibleBookings.map(b => {
                  const days = b.pickupDate && b.dropoffDate
                    ? Math.max(1, differenceInDays(parseISO(b.dropoffDate), parseISO(b.pickupDate)))
                    : 1;
                  const dot = STATUS_DOT[b.status] || STATUS_DOT.cancelled;
                  const pickupStr = b.pickupDate ? format(parseISO(b.pickupDate), "dd MMM").toUpperCase() : "—";
                  return (
                    <div key={b.id} className="sv-booking-item">
                      {/* Date */}
                      <div className="sv-bk-date">{pickupStr}</div>

                      {/* Car */}
                      <div>
                        <div className="sv-bk-car">{b.carName || "Vehicle"}</div>
                        <div className="sv-bk-sub">{b.carBrand} · {days}d · {b.pickupLocation || "—"}</div>
                      </div>

                      {/* Price */}
                      <div className="sv-bk-price">{formatCurrency(b.totalPrice)}</div>

                      {/* Status */}
                      <div>
                        <div className="sv-bk-status">
                          {b.status}
                          <span
                            className="sv-status-dot"
                            style={{ background: dot.bg, boxShadow: `0 0 8px ${dot.glow}` }}
                          />
                        </div>
                        {b.status === "confirmed" && (
                          <button className="sv-cancel-btn" onClick={() => cancelBooking(b.id)}>
                            Cancel ×
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!loadingBookings && bookings.length > 0 && (
              <footer className="sv-footer">
                <div className="sv-page-info">
                  PAGE {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
                </div>
                <div className="sv-page-nav">
                  <button className="sv-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>PREV</button>
                  <button className={`sv-page-btn ${page < totalPages - 1 ? "active-next" : ""}`} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>NEXT</button>
                </div>
              </footer>
            )}
          </main>

          {/* ═══ PROFILE MODAL ═══ */}
          {showProfile && (
            <div className="sv-profile-overlay" onClick={e => { if (e.target === e.currentTarget) { setEditing(false); setShowProfile(false); } }}>
              <div className="sv-profile-box">
                <div className="sv-profile-title">Identity Configuration</div>

                <div className="sv-pf-field">
                  <div className="sv-pf-label">Display Name</div>
                  {editing
                    ? <input className="sv-pf-input" value={profileForm.displayName} onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))} placeholder="Your name" />
                    : <div className="sv-pf-value">{profile?.displayName || "—"}</div>
                  }
                </div>

                <div className="sv-pf-field">
                  <div className="sv-pf-label">Email (read-only)</div>
                  <div className="sv-pf-value" style={{ opacity: 0.4 }}>{user.email}</div>
                </div>

                <div className="sv-pf-field">
                  <div className="sv-pf-label">Phone</div>
                  {editing
                    ? <input className="sv-pf-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                    : <div className="sv-pf-value">{profile?.phone || "—"}</div>
                  }
                </div>

                <div className="sv-pf-field">
                  <div className="sv-pf-label">Role</div>
                  <span className="sv-role-badge">{profile?.role || "user"}</span>
                </div>

                <div className="sv-pf-actions">
                  {editing ? (
                    <>
                      <button className="sv-pf-save" disabled={savingProfile} onClick={saveProfile}>
                        <Save size={11} /> {savingProfile ? "Saving…" : "Confirm"}
                      </button>
                      <button className="sv-pf-cancel" onClick={() => setEditing(false)}>
                        <X size={11} /> Discard
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="sv-pf-save" onClick={() => setEditing(true)}>
                        <Edit2 size={11} /> Edit
                      </button>
                      <button className="sv-pf-cancel" onClick={() => { setEditing(false); setShowProfile(false); }}>
                        <X size={11} /> Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
