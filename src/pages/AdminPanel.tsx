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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

        .ap-root {
          background: #0f172a;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.1) 0px, transparent 50%);
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: block;
        }

        /* ═══ SIDEBAR ═══ */
        .ap-aside {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 96px 0 2rem;
          position: fixed;
          top: 0; left: 0;
          height: 100%;
          width: 88px;
          z-index: 50;
          gap: 12px;
          box-shadow: 4px 0 24px rgba(0,0,0,0.2);
        }

        .ap-logo {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          margin-bottom: 2.5rem;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }

        .ap-nav-btn {
          position: relative;
          width: 52px; height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #94a3b8;
          background: transparent;
          border: 1px solid transparent;
          outline: none;
        }

        .ap-nav-btn:hover { 
          background: rgba(255,255,255,0.05); 
          color: #f8fafc; 
          transform: translateY(-2px);
        }
        .ap-nav-btn.active { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
          color: #a78bfa; 
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .ap-tooltip {
          position: absolute;
          left: calc(100% + 16px);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f8fafc;
          font-size: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 8px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transform: translateX(-10px);
        }

        .ap-nav-btn:hover .ap-tooltip { opacity: 1; transform: translateX(0); }

        .ap-badge {
          position: absolute;
          top: 10px; right: 10px;
          width: 8px; height: 8px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 8px #ef4444;
        }

        /* ═══ MAIN ═══ */
        .ap-main {
          margin-left: 88px;
          width: calc(100vw - 88px);
          padding: 96px 3.5rem 4rem;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ═══ PAGE HEADER ═══ */
        .ap-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3rem;
          animation: ap-fade-up 0.6s ease forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        .ap-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }

        .ap-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f8fafc;
          line-height: 1;
        }

        /* ═══ STAT TILES ═══ */
        .ap-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
          width: 100%;
        }

        .strata-tile {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 2rem;
          overflow: hidden;
          cursor: default;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          opacity: 0;
          transform: translateY(24px);
          box-sizing: border-box;
          box-shadow: 0 4px 24px -1px rgba(0,0,0,0.1);
        }

        .strata-tile:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -4px rgba(0,0,0,0.2), 0 0 20px rgba(139, 92, 246, 0.1) inset;
        }

        .tile-deco {
          position: absolute;
          top: 0; left: 0;
          height: 3px; width: 60px;
          background: linear-gradient(90deg, #8b5cf6 0%, transparent 100%);
          border-top-left-radius: 20px;
        }

        .tile-kpi {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .tile-value {
          font-family: 'Outfit', sans-serif;
          font-size: 2.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f8fafc;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .tile-unit {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 400;
          margin-left: 6px;
        }

        /* ═══ SECTION CARD ═══ */
        .ap-section {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          animation: ap-fade-up 0.6s 0.2s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          margin-bottom: 2rem;
          box-shadow: 0 4px 24px -1px rgba(0,0,0,0.1);
        }

        .ap-section-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.01);
        }

        .ap-section-label {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        /* ═══ TABLE ═══ */
        .ap-tbl {
          width: 100%;
          border-collapse: collapse;
        }

        .ap-tbl th {
          padding: 1.25rem 2rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          text-align: left;
          white-space: nowrap;
          background: rgba(255,255,255,0.01);
        }

        .ap-tbl td {
          padding: 1.25rem 2rem;
          font-size: 0.9rem;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
          transition: all 0.2s ease;
        }

        .ap-tbl tr:hover td { background: rgba(255,255,255,0.02); color: #f8fafc; }
        .ap-tbl tr:last-child td { border-bottom: none; }

        .ap-tbl td strong { color: #f8fafc; font-weight: 600; display: block; margin-bottom: 4px; font-size: 0.95rem; }
        .ap-tbl .sub { font-size: 0.8rem; color: #64748b; }

        /* ═══ STATUS PILLS ═══ */
        .s-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em;
          background: rgba(255,255,255,0.05);
          color: #cbd5e1;
          white-space: nowrap;
        }

        .s-pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .s-confirmed { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .s-confirmed::before { background: #34d399; box-shadow: 0 0 8px #34d399; }
        .s-completed { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
        .s-completed::before { background: #a78bfa; box-shadow: 0 0 8px #a78bfa; }
        .s-pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .s-pending::before   { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
        .s-cancelled { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .s-cancelled::before { background: #f87171; box-shadow: 0 0 8px #f87171; }
        .s-admin { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .s-admin::before     { background: #60a5fa; box-shadow: 0 0 8px #60a5fa; }
        .s-user::before      { background: #64748b; }

        /* ═══ PROGRESS ═══ */
        .prog-wrap {
          width: 80px; height: 4px;
          background: rgba(255,255,255,0.1);
          display: inline-block; vertical-align: middle;
          margin-right: 10px;
          border-radius: 2px;
          overflow: hidden;
        }
        .prog-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); box-shadow: 0 0 8px rgba(139, 92, 246, 0.5); }

        /* ═══ CAR THUMB ═══ */
        .car-thumb {
          width: 80px; height: 50px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: block;
        }

        /* ═══ BUTTONS ═══ */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: #ffffff;
          padding: 12px 24px;
          font-size: 0.85rem; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
        }

        .btn-primary:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4); 
        }
        .btn-primary:disabled { opacity: 0.6; cursor: wait; transform: none; }

        .btn-ico {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02); color: #94a3b8;
          cursor: pointer; transition: all 0.2s;
          margin-right: 6px;
        }

        .btn-ico:hover { color: #f8fafc; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
        .btn-ico.del:hover { color: #f87171; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }

        .status-sel {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1; padding: 6px 12px;
          font-size: 0.8rem; font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer; outline: none; border-radius: 8px;
          transition: all 0.2s;
        }

        .status-sel:hover { border-color: rgba(255,255,255,0.2); }
        .status-sel option { background: #0f172a; color: #f8fafc; }

        /* ═══ MESSAGES ═══ */
        .msg-row {
          display: grid;
          grid-template-columns: 12px 1fr auto;
          gap: 20px; align-items: start;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.2s;
        }
        .msg-row:last-child { border-bottom: none; }
        .msg-row:hover { background: rgba(255,255,255,0.02); }
        .msg-row.unread { background: rgba(59, 130, 246, 0.03); }

        .msg-dot { width: 8px; height: 8px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 10px #60a5fa; margin-top: 6px; flex-shrink: 0; }
        .msg-from { font-weight: 600; font-size: 0.95rem; color: #f8fafc; font-family: 'Outfit', sans-serif; }
        .msg-meta { font-size: 0.8rem; color: #64748b; margin-top: 4px; font-weight: 500; }
        .msg-body { font-size: 0.9rem; color: #94a3b8; margin-top: 10px; line-height: 1.6; }

        /* ═══ MODAL ═══ */
        .ap-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 999;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }

        .ap-modal {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          animation: ap-fade-up 0.3s ease-out forwards;
        }

        .ap-modal-h { font-family: 'Outfit', sans-serif; font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 2rem; }

        .ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ap-fld { display: flex; flex-direction: column; gap: 8px; }
        .ap-fld.full { grid-column: span 2; }

        .ap-lbl {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem; font-weight: 500; color: #94a3b8;
        }

        .ap-inp, .ap-sel, .ap-txt {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 12px 16px;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
          border-radius: 12px;
        }

        .ap-inp:focus, .ap-sel:focus, .ap-txt:focus {
          border-color: #8b5cf6;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .ap-inp::placeholder, .ap-txt::placeholder { color: #475569; }
        .ap-sel option { background: #1e293b; color: #f8fafc; }
        .ap-txt { min-height: 100px; resize: vertical; }
        .ap-inp:disabled { opacity: 0.5; cursor: not-allowed; }

        .feat-chk { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; color: #cbd5e1; font-weight: 500; }
        .feat-chk input { accent-color: #8b5cf6; width: 18px; height: 18px; cursor: pointer; }

        .ap-modal-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 3rem; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1; padding: 12px 24px;
          font-size: 0.85rem; font-weight: 600; font-family: 'Outfit', sans-serif;
          cursor: pointer; border-radius: 12px; transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }

        .err-bar {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 12px 16px; border-radius: 12px;
          color: #fca5a5; font-size: 0.9rem;
          margin-bottom: 24px;
        }

        /* ═══ EMPTY STATE ═══ */
        .ap-empty {
          padding: 4rem 2rem;
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem; color: #64748b;
          text-align: center;
          font-weight: 500;
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
          .ap-main { margin-left: 0; width: 100vw; padding: 80px 1.5rem 2rem; }
          .ap-stats-grid { grid-template-columns: 1fr; }
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
                        <th>Vehicle</th><th>Email</th><th>Pickup</th><th>Drop-off</th><th>Location</th><th>Total</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {bookings.slice(0, 8).map(b => (
                          <tr key={b.id}>
                            <td><strong>{b.carName || "—"}</strong><span className="sub">{b.carBrand || "Unknown"}</span></td>
                            <td><span className="sub" style={{ textTransform: "none", color: "#f0f2f5" }}>{b.userEmail || b.driverName || "—"}</span></td>
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
                      <th>Vehicle</th><th>User Email</th><th>Pickup</th><th>Drop-off</th><th>Location</th><th>Total</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.carName || "—"}</strong>
                            <span className="sub">{b.carBrand}</span>
                          </td>
                          <td><span className="sub" style={{ textTransform: "none" }}>{b.userEmail || b.driverName || "—"}</span></td>
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
