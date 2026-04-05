import { useEffect, useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mouse parallax on container
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("sending");
    try {
      await addDoc(collection(db, "messages"), {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        status: "unread",
        createdAt: serverTimestamp(),
      });
      setSubmitState("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitState("idle"), 4000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setSubmitState("idle");
    }
  };

  const today = new Date().getDay(); // 0=Sun, 1=Mon...5=Fri, 6=Sat
  const isWeekday = today >= 1 && today <= 5;
  const isSaturday = today === 6;

  return (
    <>
      <style>{`
        :root {
          --contact-bg: #050608;
          --contact-accent: #00f2ff;
          --contact-accent-dim: rgba(0, 242, 255, 0.15);
          --contact-glass: rgba(15, 18, 22, 0.85);
          --contact-border: rgba(255, 255, 255, 0.08);
          --contact-glow: 0 0 20px rgba(0, 242, 255, 0.3);
        }

        .contact-page {
          background-color: var(--contact-bg);
          background-image:
            radial-gradient(circle at 50% 50%, #10141d 0%, #050608 100%),
            linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 40px 40px, 40px 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 80px;
          overflow-x: hidden;
          position: relative;
        }

        /* Scanline Effect */
        .contact-page::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(to bottom, transparent, var(--contact-accent-dim), transparent);
          opacity: 0.3;
          z-index: 10;
          pointer-events: none;
          animation: contact-scan 8s linear infinite;
        }

        @keyframes contact-scan {
          0%   { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }

        .hud-container {
          width: 100%;
          max-width: 1200px;
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 80px;
          position: relative;
          animation: hud-reveal 1s cubic-bezier(0.16, 1, 0.3, 1);
          perspective: 1000px;
        }

        @keyframes hud-reveal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Telemetry Sidebar ── */
        .telemetry {
          display: flex;
          flex-direction: column;
          gap: 48px;
          border-left: 1px solid var(--contact-border);
          padding-left: 40px;
        }

        .tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--contact-accent);
          letter-spacing: 3px;
          margin-bottom: 8px;
          display: block;
        }

        .telemetry-h1 {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: -2px;
          background: linear-gradient(to bottom, #fff, #666);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .data-point {
          position: relative;
          transition: transform 0.3s ease;
        }

        .data-point:hover {
          transform: translateX(10px);
        }

        .data-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .data-label::before {
          content: "";
          width: 6px;
          height: 6px;
          background: var(--contact-accent);
          display: inline-block;
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%);
          flex-shrink: 0;
        }

        .data-value {
          font-size: 1.15rem;
          font-weight: 400;
          letter-spacing: 0.5px;
          color: #e0e0e0;
          line-height: 1.5;
        }

        .business-hours {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .hour-row {
          display: flex;
          justify-content: space-between;
          color: #666;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          padding-bottom: 4px;
          gap: 8px;
        }

        .hour-row.active {
          color: var(--contact-accent);
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          margin-right: 6px;
          box-shadow: 0 0 10px #22c55e;
          animation: status-pulse 2s infinite;
        }

        @keyframes status-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* ── Ignition Form ── */
        .ignition-form {
          background: var(--contact-glass);
          padding: 50px;
          border: 1px solid var(--contact-border);
          backdrop-filter: blur(20px);
          position: relative;
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%);
        }

        .ignition-form::before {
          content: "SYSTEM READY";
          position: absolute;
          top: 20px;
          right: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: var(--contact-accent);
          opacity: 0.5;
          letter-spacing: 2px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .full-width {
          grid-column: span 2;
        }

        .input-group {
          position: relative;
        }

        .input-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--contact-border);
          padding: 14px 18px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          border-radius: 0;
          cursor: text;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(255,255,255,0.15);
          font-size: 12px;
          letter-spacing: 1px;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: var(--contact-accent);
          background: rgba(0, 242, 255, 0.03);
          box-shadow: inset 0 0 10px rgba(0, 242, 255, 0.05);
        }

        .form-textarea {
          height: 120px;
          resize: none;
        }

        .btn-ignition {
          margin-top: 30px;
          width: 100%;
          background: transparent;
          border: 1px solid var(--contact-accent);
          padding: 20px;
          color: var(--contact-accent);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-size: 13px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: crosshair;
        }

        .btn-ignition:hover:not(:disabled) {
          background: var(--contact-accent);
          color: var(--contact-bg);
          box-shadow: var(--contact-glow);
        }

        .btn-ignition::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg);
          transition: 0.5s;
        }

        .btn-ignition:hover::after {
          left: 100%;
        }

        .btn-ignition.sending {
          border-color: #888;
          color: #888;
          cursor: wait;
        }

        .btn-ignition.sent {
          border-color: #22c55e;
          color: #22c55e;
        }

        @media (max-width: 900px) {
          .hud-container {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 20px;
          }
          .telemetry {
            border-left: none;
            border-bottom: 1px solid var(--contact-border);
            padding-left: 0;
            padding-bottom: 40px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .telemetry-h1 {
            font-size: 2.5rem;
          }
        }
      `}</style>

      <div className="contact-page">
        <main className="hud-container" ref={containerRef}>

          {/* LEFT: Telemetry & Info */}
          <section className="telemetry">
            <div>
              <span className="tag">Interface v4.02</span>
              <h1 className="telemetry-h1">Pit Stop<br />Inquiry</h1>
            </div>

            <div className="data-point">
              <span className="data-label">Voice Channel</span>
              <div className="data-value">+1 (555) 000-0000</div>
            </div>

            <div className="data-point">
              <span className="data-label">Secure Uplink</span>
              <div className="data-value">contact@drivex.com</div>
            </div>

            <div className="data-point">
              <span className="data-label">Coordinates</span>
              <div className="data-value">
                27.1767° N, 78.0081° E<br />
                Agra, Uttar Pradesh, India
              </div>
            </div>

            <div className="data-point">
              <span className="data-label">Operational Window</span>
              <div className="business-hours">
                <div className={`hour-row ${isWeekday ? "active" : ""}`}>
                  <span>MON–FRI</span>
                  <span>08:00 – 20:00</span>
                </div>
                <div className={`hour-row ${isSaturday ? "active" : ""}`}>
                  <span>SAT</span>
                  <span>10:00 – 18:00</span>
                </div>
                <div className="hour-row">
                  <span>SUN</span>
                  <span>CLOSED</span>
                </div>
                <div className="hour-row active">
                  <span>STATUS</span>
                  <span>
                    <span className="status-dot" />
                    ONLINE
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Ignition Form */}
          <section className="ignition-form">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="contact-name">Pilot Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="form-input"
                    placeholder="E.G. JAMES HUNT"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="contact-email">Uplink Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-input"
                    placeholder="NAME@DOMAIN.COM"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="input-group full-width">
                  <label className="input-label" htmlFor="contact-subject">Subject / Model Series</label>
                  <input
                    id="contact-subject"
                    type="text"
                    className="form-input"
                    placeholder="TECHNICAL SUPPORT / BOOKING / INQUIRY"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="input-group full-width">
                  <label className="input-label" htmlFor="contact-message">Transmission Details</label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    placeholder="ENTER MESSAGE..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitState === "sending"}
                className={`btn-ignition ${submitState !== "idle" ? submitState : ""}`}
              >
                {submitState === "idle" && "Initiate Transmission"}
                {submitState === "sending" && "TRANSMITTING..."}
                {submitState === "sent" && "✓ MESSAGE DELIVERED"}
              </button>
            </form>
          </section>

        </main>
      </div>
    </>
  );
}
