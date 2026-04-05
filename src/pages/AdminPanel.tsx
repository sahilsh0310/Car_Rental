import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, onSnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Car, Booking, UserProfile, ContactMessage } from "../types";
import { formatCurrency } from "../lib/utils";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, Save, X, Check } from "lucide-react";

type AdminTab = "overview" | "cars" | "bookings" | "users" | "messages";

const EMPTY_CAR: Omit<Car, "id"> = {
  name: "", brand: "", type: "Luxury", pricePerDay: 0, rating: 4.5,
  image: "", images: [], description: "", isFeatured: false,
  specs: { engine: "", seats: 4, mileage: "", fuelType: "Gasoline", transmission: "Automatic" }
};

export default function AdminPanel() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Car modal
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [carForm, setCarForm] = useState<Omit<Car, "id">>(EMPTY_CAR);
  const [savingCar, setSavingCar] = useState(false);
  const [carError, setCarError] = useState<string | null>(null);

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({ displayName: "", email: "", phone: "", role: "user" as "user" | "admin" });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (profile && profile.role !== "admin") navigate("/");
  }, [profile, navigate]);

  // ── Real-time Firestore listeners ──
  useEffect(() => {
    if (!profile || profile.role !== "admin") return;

    let loaded = 0;
    const markLoaded = () => { loaded++; if (loaded >= 4) setLoading(false); };

    const unsubCars = onSnapshot(collection(db, "cars"), snap => {
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)).sort((a, b) => a.brand.localeCompare(b.brand)));
      markLoaded();
    }, e => { console.error("cars:", e); markLoaded(); });

    const unsubBookings = onSnapshot(query(collection(db, "bookings"), orderBy("createdAt", "desc")), snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      markLoaded();
    }, e => { console.error("bookings:", e); markLoaded(); });

    const unsubUsers = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      markLoaded();
    }, e => { console.error("users:", e); markLoaded(); });

    const unsubMessages = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
      markLoaded();
    }, e => { console.error("messages:", e); markLoaded(); });

    return () => { unsubCars(); unsubBookings(); unsubUsers(); unsubMessages(); };
  }, [profile]);

  // Strata card mouse glare effect
  useEffect(() => {
    const handlers: Array<{ el: HTMLDivElement; fn: (e: MouseEvent) => void }> = [];
    cardsRef.current.forEach(card => {
      if (!card) return;
      const fn = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      card.addEventListener("mousemove", fn);
      handlers.push({ el: card, fn });
    });
    return () => handlers.forEach(({ el, fn }) => el.removeEventListener("mousemove", fn));
  }, [loading, tab]);

  /* ── Car CRUD ── */
  const openAddCar = () => { setCarForm(EMPTY_CAR); setEditingCar(null); setCarError(null); setShowCarModal(true); };
  const openEditCar = (car: Car) => { setCarForm({ ...car }); setEditingCar(car); setCarError(null); setShowCarModal(true); };

  const saveCar = async () => {
    setSavingCar(true); setCarError(null);
    try {
      if (editingCar) {
        await updateDoc(doc(db, "cars", editingCar.id), { ...carForm });
      } else {
        await addDoc(collection(db, "cars"), { ...carForm, createdAt: serverTimestamp() });
      }
      setShowCarModal(false);
      // No manual state update needed — onSnapshot handles it automatically
    } catch (e: any) {
      setCarError(e?.code === "permission-denied"
        ? "Permission denied — set your Firestore role to 'admin'."
        : (e?.message || "Unknown error"));
    } finally { setSavingCar(false); }
  };

  const deleteCar = async (id: string) => {
    if (!confirm("Delete this vehicle permanently?")) return;
    await deleteDoc(doc(db, "cars", id));
    // onSnapshot will auto-update the list
  };

  /* ── Booking ── */
  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    await updateDoc(doc(db, "bookings", id), { status });
  };

  /* ── User CRUD ── */
  const openEditUser = (u: UserProfile) => {
    setUserForm({ displayName: u.displayName || "", email: u.email, phone: u.phone || "", role: u.role });
    setEditingUser(u); setShowUserModal(true);
  };

  const saveUser = async () => {
    if (!editingUser) return; setSavingUser(true);
    try {
      await updateDoc(doc(db, "users", editingUser.uid), {
        displayName: userForm.displayName, phone: userForm.phone, role: userForm.role
      });
      setShowUserModal(false);
    } catch (e) { console.error(e); } finally { setSavingUser(false); }
  };

  const deleteUser = async (uid: string) => {
    if (!confirm("Remove this user's Firestore profile?")) return;
    await deleteDoc(doc(db, "users", uid));
  };

  /* ── Messages ── */
  const markRead = async (id: string) => {
    await updateDoc(doc(db, "messages", id), { status: "read" });
  };
  const deleteMessage = async (id: string) => {
    await deleteDoc(doc(db, "messages", id));
  };

  if (!profile || profile.role !== "admin") return null;

  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);
  const unread = messages.filter(m => m.status === "unread").length;

  const NAV_ITEMS: { key: AdminTab; label: string; svg: React.ReactNode }[] = [
    { key: "overview", label: "Overview", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { key: "cars", label: "Fleet", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> },
    { key: "bookings", label: "Bookings", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { key: "users", label: "Users", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key: "messages", label: "Messages", svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

        .ap-root {
          background-color: #05070a;
          background-image:
            radial-gradient(circle at 15% 15%, rgba(0,242,255,0.04) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(0,242,255,0.03) 0%, transparent 45%);
          color: #f0f2f5;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: block;
        }

        /* ═══ SIDEBAR ═══ */
        .ap-aside {
          background: #0a0c10;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 96px 0 2rem;
          position: fixed;
          top: 0; left: 0;
          height: 100%;
          width: 80px;
          z-index: 50;
          gap: 4px;
        }

        .ap-logo {
          width: 26px; height: 26px;
          background: #00f2ff;
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          margin-bottom: 2rem;
          flex-shrink: 0;
        }

        .ap-nav-btn {
          position: relative;
          width: 48px; height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          color: #4a5568;
          background: transparent;
          border: none;
          outline: none;
        }

        .ap-nav-btn:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .ap-nav-btn.active { background: rgba(0,242,255,0.08); color: #00f2ff; box-shadow: inset 0 0 0 1px rgba(0,242,255,0.2); }

        .ap-tooltip {
          position: absolute;
          left: calc(100% + 14px);
          background: #14171d;
          border: 1px solid rgba(255,255,255,0.08);
          color: #f0f2f5;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          padding: 5px 10px;
          border-radius: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .ap-nav-btn:hover .ap-tooltip { opacity: 1; }

        .ap-badge {
          position: absolute;
          top: 8px; right: 8px;
          width: 7px; height: 7px;
          background: #ff3e3e;
          border-radius: 50%;
          box-shadow: 0 0 6px #ff3e3e;
        }

        /* ═══ MAIN ═══ */
        .ap-main {
          margin-left: 80px;
          width: calc(100vw - 80px);
          padding: 96px 2.5rem 3rem;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ═══ PAGE HEADER ═══ */
        .ap-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          animation: ap-fade-up 0.6s ease forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        .ap-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #00f2ff;
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .ap-title {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #f0f2f5;
          line-height: 1;
        }

        /* ═══ STAT TILES ═══ */
        .ap-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          width: 100%;
        }

        .strata-tile {
          min-width: 0;
        }

        .strata-tile {
          position: relative;
          background: #0c0f14;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 2rem 1.75rem 1.75rem;
          overflow: hidden;
          cursor: default;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          opacity: 0;
          transform: translateY(24px);
          --mx: 50%; --my: 50%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* diagonal stripe texture */
        .strata-tile::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            -45deg,
            transparent 0,
            transparent 18px,
            rgba(255,255,255,0.012) 18px,
            rgba(255,255,255,0.012) 19px
          );
          pointer-events: none;
        }

        /* cursor glow */
        .strata-tile::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle 120px at var(--mx) var(--my), rgba(0,242,255,0.1), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .strata-tile:hover {
          border-color: rgba(0,242,255,0.2);
          background: #111520;
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }

        .strata-tile:hover::after { opacity: 1; }

        .tile-deco {
          position: absolute;
          top: 0; left: 0;
          height: 2px; width: 52px;
          background: linear-gradient(90deg, #00f2ff 0%, transparent 100%);
        }

        .tile-kpi {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4a5568;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .tile-value {
          font-size: 2.6rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #f0f2f5;
          line-height: 1;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .tile-unit {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #4a5568;
          font-weight: 400;
          margin-left: 4px;
        }

        /* ═══ SECTION CARD ═══ */
        .ap-section {
          background: #0c0f14;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          animation: ap-fade-up 0.6s 0.2s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          margin-bottom: 1.5rem;
        }

        .ap-section-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 12px;
          flex-wrap: wrap;
        }

        .ap-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8a94a6;
        }

        /* ═══ TABLE ═══ */
        .ap-tbl {
          width: 100%;
          border-collapse: collapse;
        }

        .ap-tbl th {
          padding: 0.85rem 1.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          text-align: left;
          white-space: nowrap;
        }

        .ap-tbl td {
          padding: 1rem 1.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255,255,255,0.025);
          vertical-align: middle;
          transition: all 0.15s ease;
        }

        .ap-tbl tr:hover td { background: rgba(255,255,255,0.015); color: #e2e8f0; }
        .ap-tbl tr:last-child td { border-bottom: none; }

        .ap-tbl td strong { color: #f0f2f5; font-weight: 600; display: block; margin-bottom: 2px; font-size: 0.88rem; }
        .ap-tbl .sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4a5568; }

        /* ═══ STATUS PILLS ═══ */
        .s-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          text-transform: uppercase; letter-spacing: 0.08em;
          background: rgba(255,255,255,0.04);
          color: #8a94a6;
          white-space: nowrap;
        }

        .s-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .s-confirmed::before { background:#00ff88; box-shadow:0 0 5px #00ff88; }
        .s-completed::before { background:#7c6ff7; box-shadow:0 0 5px #7c6ff7; }
        .s-pending::before   { background:#f0c040; box-shadow:0 0 5px #f0c040; }
        .s-cancelled::before { background:#ff3e3e; box-shadow:0 0 5px #ff3e3e; }
        .s-admin::before     { background:#00f2ff; box-shadow:0 0 5px #00f2ff; }
        .s-user::before      { background:#4a5568; }

        /* ═══ PROGRESS ═══ */
        .prog-wrap {
          width: 72px; height: 3px;
          background: rgba(255,255,255,0.06);
          display: inline-block; vertical-align: middle;
          margin-right: 8px;
          border-radius: 1px;
          overflow: hidden;
        }
        .prog-fill { height: 100%; border-radius: 1px; background: #00f2ff; box-shadow: 0 0 6px rgba(0,242,255,0.5); }

        /* ═══ CAR THUMB ═══ */
        .car-thumb {
          width: 72px; height: 46px;
          object-fit: cover;
          border-radius: 2px;
          filter: brightness(0.9) saturate(0.8);
          display: block;
        }

        /* ═══ BUTTONS ═══ */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #00f2ff; border: none;
          color: #05070a;
          padding: 9px 20px;
          font-size: 11px; font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          border-radius: 2px;
        }

        .btn-primary:hover { background: #40f8ff; box-shadow: 0 0 20px rgba(0,242,255,0.25); }
        .btn-primary:disabled { opacity: 0.4; cursor: wait; }

        .btn-ico {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent; color: #4a5568;
          cursor: pointer; transition: all 0.15s;
          margin-right: 4px;
        }

        .btn-ico:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.15); }
        .btn-ico.del:hover { color: #ff3e3e; border-color: rgba(255,62,62,0.3); }

        .status-sel {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #94a3b8; padding: 5px 10px;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.08em;
          cursor: pointer; outline: none; border-radius: 2px;
        }

        .status-sel option { background: #0c0f14; color: #f0f2f5; text-transform: none; }

        /* ═══ MESSAGES ═══ */
        .msg-row {
          display: grid;
          grid-template-columns: 10px 1fr auto;
          gap: 16px; align-items: start;
          padding: 1.2rem 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.15s;
        }
        .msg-row:last-child { border-bottom: none; }
        .msg-row:hover { background: rgba(255,255,255,0.015); }
        .msg-row.unread { border-left: 2px solid rgba(0,242,255,0.4); padding-left: 1.6rem; }

        .msg-dot { width: 7px; height: 7px; border-radius: 50%; background: #00f2ff; box-shadow: 0 0 5px #00f2ff; margin-top: 5px; flex-shrink: 0; }
        .msg-from { font-weight: 700; font-size: 0.88rem; color: #f0f2f5; }
        .msg-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #4a5568; margin-top: 3px; }
        .msg-body { font-size: 0.82rem; color: #4a5568; margin-top: 8px; line-height: 1.55; }

        /* ═══ MODAL ═══ */
        .ap-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(6px);
          z-index: 999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .ap-modal {
          background: #0c0f14;
          border: 1px solid rgba(255,255,255,0.07);
          border-top: 2px solid rgba(0,242,255,0.4);
          border-radius: 2px;
          padding: 2.5rem;
          width: 100%;
          max-width: 700px;
          max-height: 88vh;
          overflow-y: auto;
        }

        .ap-modal-h { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.03em; color: #f0f2f5; margin-bottom: 1.75rem; }

        .ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ap-fld { display: flex; flex-direction: column; gap: 5px; }
        .ap-fld.full { grid-column: span 2; }

        .ap-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #4a5568;
        }

        .ap-inp, .ap-sel, .ap-txt {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 10px 13px;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          border-radius: 2px;
        }

        .ap-inp:focus, .ap-sel:focus, .ap-txt:focus {
          border-color: rgba(0,242,255,0.35);
          box-shadow: 0 0 0 3px rgba(0,242,255,0.06);
        }

        .ap-inp::placeholder, .ap-txt::placeholder { color: rgba(255,255,255,0.12); font-size: 12px; }
        .ap-sel option { background: #0c0f14; color: #e2e8f0; }
        .ap-txt { min-height: 85px; resize: vertical; }
        .ap-inp:disabled { opacity: 0.3; cursor: not-allowed; }

        .feat-chk { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #8a94a6; font-family: 'JetBrains Mono', monospace; }
        .feat-chk input { accent-color: #00f2ff; width: 14px; height: 14px; cursor: pointer; }

        .ap-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 2rem; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; border: 1px solid rgba(255,255,255,0.08);
          color: #8a94a6; padding: 9px 18px;
          font-size: 11px; font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.1em;
          cursor: pointer; border-radius: 2px; transition: all 0.15s;
        }
        .btn-ghost:hover { color: #f0f2f5; border-color: rgba(255,255,255,0.2); }

        .err-bar {
          background: rgba(255,62,62,0.08); border: 1px solid rgba(255,62,62,0.25);
          padding: 10px 14px; border-radius: 2px;
          color: #fca5a5; font-size: 11px; line-height: 1.5;
          margin-bottom: 16px;
        }

        /* ═══ EMPTY STATE ═══ */
        .ap-empty {
          padding: 3rem 2rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #2a3040;
          text-transform: uppercase; letter-spacing: 0.1em;
        }

        /* ═══ ANIMATIONS ═══ */
        @keyframes ap-fade-up {
          to { opacity: 1; transform: translateY(0); }
        }

        .s1 { animation: ap-fade-up 0.6s 0.05s ease forwards; }
        .s2 { animation: ap-fade-up 0.6s 0.12s ease forwards; }
        .s3 { animation: ap-fade-up 0.6s 0.19s ease forwards; }
        .s4 { animation: ap-fade-up 0.6s 0.26s ease forwards; }

        @media (max-width: 1200px) {
          .ap-stats-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .ap-aside { display: none; }
          .ap-main { margin-left: 0; width: 100vw; padding: 80px 1rem 2rem; }
          .ap-stats-grid { grid-template-columns: 1fr 1fr; }
          .ap-grid { grid-template-columns: 1fr; }
          .ap-fld.full { grid-column: span 1; }
        }
      `}</style>

      <div className="ap-root">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="ap-aside">
          <div className="ap-logo" />
          {NAV_ITEMS.map(({ key, label, svg }) => (
            <button
              key={key}
              className={`ap-nav-btn ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              {svg}
              {key === "messages" && unread > 0 && <span className="ap-badge" />}
              <span className="ap-tooltip">{label}</span>
            </button>
          ))}
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="ap-main">

          {/* Page header */}
          <div className="ap-page-header">
            <div>
              <div className="ap-eyebrow">DriveX Admin // Strategic Oversight</div>
              <h1 className="ap-title">{NAV_ITEMS.find(n => n.key === tab)?.label}</h1>
            </div>
            {/* Fleet-specific Add button lives here */}
            {tab === "cars" && (
              <button className="btn-primary" onClick={openAddCar}>
                <Plus size={13} /> Add Vehicle
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#2a3040", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              CONNECTING TO TELEMETRY…
            </div>
          ) : (
            <>

              {/* ═══ OVERVIEW ═══ */}
              {tab === "overview" && (
                <>
                  <div className="ap-stats-grid">
                    {([
                      { label: "Total Fleet", value: cars.length, unit: "vehicles", cls: "s1" },
                      { label: "Total Bookings", value: bookings.length, unit: "reservations", cls: "s2" },
                      { label: "Revenue", value: formatCurrency(totalRevenue), unit: "", cls: "s3" },
                      { label: "Registered Users", value: users.length, unit: "accounts", cls: "s4" },
                    ] as const).map((s, i) => (
                      <div
                        key={s.label}
                        className={`strata-tile ${s.cls}`}
                        ref={el => { cardsRef.current[i] = el; }}
                      >
                        <div className="tile-deco" />
                        <div className="tile-kpi">{s.label}</div>
                        <div className="tile-value">
                          {s.value}
                          {s.unit && <span className="tile-unit">{s.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ap-section">
                    <div className="ap-section-bar">
                      <span className="ap-section-label">Recent Bookings</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#4a5568" }}>
                        {bookings.length} total records
                      </span>
                    </div>
                    <table className="ap-tbl">
                      <thead><tr>
                        <th>Vehicle</th><th>Pickup</th><th>Drop-off</th><th>Location</th><th>Total</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {bookings.slice(0, 8).map(b => (
                          <tr key={b.id}>
                            <td><strong>{b.carName || "—"}</strong><span className="sub">{b.carBrand || "Unknown"}</span></td>
                            <td><span className="sub">{b.pickupDate ? format(parseISO(b.pickupDate), "MMM d, yy") : "—"}</span></td>
                            <td><span className="sub">{b.dropoffDate ? format(parseISO(b.dropoffDate), "MMM d, yy") : "—"}</span></td>
                            <td><span className="sub">{b.pickupLocation || "—"}</span></td>
                            <td style={{ color: "#f0f2f5", fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                            <td><span className={`s-pill s-${b.status}`}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ═══ FLEET ═══ */}
              {tab === "cars" && (
                <div className="ap-section">
                  <div className="ap-section-bar">
                    <span className="ap-section-label">Fleet Registry</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#4a5568" }}>
                      {cars.length} vehicles — live
                    </span>
                  </div>
                  {cars.length === 0 && <div className="ap-empty">No vehicles registered. Add your first vehicle above.</div>}
                  <table className="ap-tbl">
                    <thead><tr>
                      <th>—</th><th>Vehicle</th><th>Type</th><th>Price / Day</th><th>Rating</th><th>Featured</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {cars.map(car => (
                        <tr key={car.id}>
                          <td style={{ width: 80 }}>
                            <img
                              className="car-thumb"
                              src={car.image}
                              alt={car.name}
                              onError={e => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=128&q=60"}
                            />
                          </td>
                          <td>
                            <strong>{car.name}</strong>
                            <span className="sub">{car.brand} · {car.specs.engine || "—"}</span>
                          </td>
                          <td><span className="s-pill">{car.type}</span></td>
                          <td style={{ color: "#f0f2f5", fontWeight: 600 }}>{formatCurrency(car.pricePerDay)}</td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <div className="prog-wrap"><div className="prog-fill" style={{ width: `${(car.rating / 5) * 100}%` }} /></div>
                              <span className="sub">{car.rating}</span>
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: car.isFeatured ? "#00f2ff" : "#2a3040" }}>
                              {car.isFeatured ? "✓ FEATURED" : "—"}
                            </span>
                          </td>
                          <td>
                            <button className="btn-ico" title="Edit" onClick={() => openEditCar(car)}><Pencil size={12} /></button>
                            <button className="btn-ico del" title="Delete" onClick={() => deleteCar(car.id)}><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ═══ BOOKINGS ═══ */}
              {tab === "bookings" && (
                <div className="ap-section">
                  <div className="ap-section-bar">
                    <span className="ap-section-label">Booking Telemetry</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#4a5568" }}>
                      {bookings.length} records — live
                    </span>
                  </div>
                  {bookings.length === 0 && <div className="ap-empty">No bookings yet.</div>}
                  <table className="ap-tbl">
                    <thead><tr>
                      <th>Vehicle</th><th>User ID</th><th>Pickup</th><th>Drop-off</th><th>Location</th><th>Total</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.carName || "—"}</strong>
                            <span className="sub">{b.carBrand}</span>
                          </td>
                          <td><span className="sub">{b.userId.slice(0, 10)}…</span></td>
                          <td><span className="sub">{b.pickupDate ? format(parseISO(b.pickupDate), "MMM d, yy") : "—"}</span></td>
                          <td><span className="sub">{b.dropoffDate ? format(parseISO(b.dropoffDate), "MMM d, yy") : "—"}</span></td>
                          <td><span className="sub">{b.pickupLocation || "—"}</span></td>
                          <td style={{ color: "#f0f2f5", fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                          <td>
                            <select
                              className="status-sel"
                              value={b.status}
                              onChange={e => updateBookingStatus(b.id, e.target.value as Booking["status"])}
                            >
                              {["pending","confirmed","completed","cancelled"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ═══ USERS ═══ */}
              {tab === "users" && (
                <div className="ap-section">
                  <div className="ap-section-bar">
                    <span className="ap-section-label">User Registry</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#4a5568" }}>
                      {users.length} accounts — live
                    </span>
                  </div>
                  {users.length === 0 && <div className="ap-empty">No users found.</div>}
                  <table className="ap-tbl">
                    <thead><tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>UID</th><th>Role</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.uid}>
                          <td><strong>{u.displayName || "—"}</strong></td>
                          <td><span className="sub">{u.email}</span></td>
                          <td><span className="sub">{u.phone || "—"}</span></td>
                          <td><span className="sub">{u.uid.slice(0, 12)}…</span></td>
                          <td><span className={`s-pill s-${u.role}`}>{u.role}</span></td>
                          <td>
                            <button className="btn-ico" title="Edit" onClick={() => openEditUser(u)}><Pencil size={12} /></button>
                            {u.uid !== user?.uid && (
                              <button className="btn-ico del" title="Delete" onClick={() => deleteUser(u.uid)}><Trash2 size={12} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ═══ MESSAGES ═══ */}
              {tab === "messages" && (
                <div className="ap-section">
                  <div className="ap-section-bar">
                    <span className="ap-section-label">Transmissions</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: unread > 0 ? "#00f2ff" : "#4a5568" }}>
                      {unread} unread
                    </span>
                  </div>
                  {messages.length === 0 && <div className="ap-empty">No transmissions received.</div>}
                  {messages.map(m => (
                    <div key={m.id} className={`msg-row ${m.status === "unread" ? "unread" : ""}`}>
                      {m.status === "unread" ? <div className="msg-dot" /> : <div />}
                      <div>
                        <div className="msg-from">
                          {m.name}
                          <span style={{ fontWeight: 400, fontSize: "11px", color: "#4a5568", marginLeft: 8 }}>— {m.email}</span>
                        </div>
                        <div className="msg-meta">&gt; {m.subject}</div>
                        <div className="msg-body">{m.message}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        {m.status === "unread" && (
                          <button className="btn-ico" title="Mark read" onClick={() => markRead(m.id!)}><Check size={12} /></button>
                        )}
                        <button className="btn-ico del" title="Delete" onClick={() => deleteMessage(m.id!)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </>
          )}
        </main>
      </div>

      {/* ═══ CAR MODAL ═══ */}
      {showCarModal && (
        <div className="ap-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCarModal(false); }}>
          <div className="ap-modal">
            <div className="ap-modal-h">{editingCar ? "Edit Vehicle" : "Register New Vehicle"}</div>
            {carError && <div className="err-bar">⚠ {carError}</div>}
            <div className="ap-grid">
              <div className="ap-fld"><label className="ap-lbl">Name</label><input className="ap-inp" value={carForm.name} onChange={e=>setCarForm(f=>({...f,name:e.target.value}))} placeholder="911 Carrera" /></div>
              <div className="ap-fld"><label className="ap-lbl">Brand</label><input className="ap-inp" value={carForm.brand} onChange={e=>setCarForm(f=>({...f,brand:e.target.value}))} placeholder="Porsche" /></div>
              <div className="ap-fld">
                <label className="ap-lbl">Type</label>
                <select className="ap-sel" value={carForm.type} onChange={e=>setCarForm(f=>({...f,type:e.target.value as Car["type"]}))}>
                  {["Sedan","SUV","Sports","Luxury","Convertible"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="ap-fld"><label className="ap-lbl">Price / Day ($)</label><input className="ap-inp" type="number" value={carForm.pricePerDay} onChange={e=>setCarForm(f=>({...f,pricePerDay:+e.target.value}))} /></div>
              <div className="ap-fld"><label className="ap-lbl">Rating (0–5)</label><input className="ap-inp" type="number" step="0.1" min="0" max="5" value={carForm.rating} onChange={e=>setCarForm(f=>({...f,rating:+e.target.value}))} /></div>
              <div className="ap-fld"><label className="ap-lbl">Engine</label><input className="ap-inp" value={carForm.specs.engine} onChange={e=>setCarForm(f=>({...f,specs:{...f.specs,engine:e.target.value}}))} placeholder="3.0L Twin-Turbo" /></div>
              <div className="ap-fld"><label className="ap-lbl">Seats</label><input className="ap-inp" type="number" min="1" max="12" value={carForm.specs.seats} onChange={e=>setCarForm(f=>({...f,specs:{...f.specs,seats:+e.target.value}}))} /></div>
              <div className="ap-fld">
                <label className="ap-lbl">Fuel Type</label>
                <select className="ap-sel" value={carForm.specs.fuelType} onChange={e=>setCarForm(f=>({...f,specs:{...f.specs,fuelType:e.target.value}}))}>
                  {["Gasoline","Electric","Hybrid","Diesel"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="ap-fld">
                <label className="ap-lbl">Transmission</label>
                <select className="ap-sel" value={carForm.specs.transmission} onChange={e=>setCarForm(f=>({...f,specs:{...f.specs,transmission:e.target.value}}))}>
                  {["Automatic","Manual","PDK Automatic","8-Speed Automatic"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="ap-fld"><label className="ap-lbl">Mileage</label><input className="ap-inp" value={carForm.specs.mileage} onChange={e=>setCarForm(f=>({...f,specs:{...f.specs,mileage:e.target.value}}))} placeholder="18/24 mpg" /></div>
              <div className="ap-fld full"><label className="ap-lbl">Main Image URL</label><input className="ap-inp" value={carForm.image} onChange={e=>setCarForm(f=>({...f,image:e.target.value}))} placeholder="https://images.unsplash.com/..." /></div>
              <div className="ap-fld full"><label className="ap-lbl">Description</label><textarea className="ap-txt" value={carForm.description} onChange={e=>setCarForm(f=>({...f,description:e.target.value}))} /></div>
              <div className="ap-fld full">
                <label className="feat-chk">
                  <input type="checkbox" checked={carForm.isFeatured} onChange={e=>setCarForm(f=>({...f,isFeatured:e.target.checked}))} />
                  Mark as Featured — appears on homepage
                </label>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="btn-ghost" onClick={()=>setShowCarModal(false)}><X size={11}/> Cancel</button>
              <button className="btn-primary" disabled={savingCar} onClick={saveCar}><Save size={11}/> {savingCar ? "Saving…" : "Save Vehicle"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ USER MODAL ═══ */}
      {showUserModal && editingUser && (
        <div className="ap-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowUserModal(false);}}>
          <div className="ap-modal" style={{ maxWidth: 480 }}>
            <div className="ap-modal-h">Edit User</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#4a5568", marginBottom:"20px", letterSpacing:"0.06em" }}>
              UID: {editingUser.uid}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div className="ap-fld"><label className="ap-lbl">Display Name</label><input className="ap-inp" value={userForm.displayName} onChange={e=>setUserForm(f=>({...f,displayName:e.target.value}))} placeholder="Full name" /></div>
              <div className="ap-fld"><label className="ap-lbl">Email (read-only)</label><input className="ap-inp" value={userForm.email} disabled /></div>
              <div className="ap-fld"><label className="ap-lbl">Phone</label><input className="ap-inp" value={userForm.phone} onChange={e=>setUserForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (555) 000-0000" /></div>
              <div className="ap-fld">
                <label className="ap-lbl">Role</label>
                <select className="ap-sel" value={userForm.role} onChange={e=>setUserForm(f=>({...f,role:e.target.value as "user"|"admin"}))}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="btn-ghost" onClick={()=>setShowUserModal(false)}><X size={11}/> Cancel</button>
              <button className="btn-primary" disabled={savingUser} onClick={saveUser}><Save size={11}/> {savingUser ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
