import { useEffect, useRef } from "react";

const STATS = [
  { val: "50+",  label: "Fleet Vehicles" },
  { val: "12",   label: "Global Cities" },
  { val: "10k+", label: "Happy Clients" },
  { val: "4.9",  label: "Avg Rating" },
];

const PILLARS = [
  { id: "001", heading: "Philosophy", body: "DriveX was built on one belief: access to extraordinary machines should not be gated. We curate only vehicles that define their class — no compromises, no placeholders." },
  { id: "002", heading: "Technology", body: "Real-time fleet telemetry, instant booking confirmation, and a zero-friction checkout — our stack is engineered to disappear so the vehicle can take centre stage." },
  { id: "003", heading: "Standards", body: "Every car passes a 150-point inspection before every rental. Our team of certified technicians works around the clock so your drive is flawless from ignition to handover." },
  { id: "004", heading: "Vision",     body: "We are building the definitive premium rental network — from coastal highways to urban circuits. Wherever the road leads, a DriveX vehicle is waiting." },
];

const TEAM = [
  { name: "Aryan Mehta",    role: "Founder & CEO",        gradient: "135deg, #00f2ff, #0050a0" },
  { name: "Priya Sharma",   role: "Head of Fleet",         gradient: "135deg, #7000ff, #ff00c1" },
  { name: "James Carver",   role: "Chief Experience",      gradient: "135deg, #00ff88, #00a0ff" },
  { name: "Leila Hassan",   role: "Customer Relations",    gradient: "135deg, #ff4d4d, #ff00c1" },
];

export default function About() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top  = `${e.clientY}px`;
    };
    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("mo-active"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".mo-reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Card parallax tilt
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".mo-card"));
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth  / 2 - e.pageX;
      const cy = window.innerHeight / 2 - e.pageY;
      cards.forEach(card => {
        if (!card.classList.contains("mo-active")) return;
        card.style.transform = `rotateY(${cx / 60}deg) rotateX(${cy / 60}deg)`;
      });
    };
    const onLeave = () => cards.forEach(c => (c.style.transform = ""));
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;700&family=JetBrains+Mono:wght@300;500&display=swap');

        /* Custom cursor */
        * { cursor: none !important; }

        .mo-cursor {
          position: fixed;
          width: 38px; height: 38px;
          background: rgba(0,242,255,0.06);
          border: 1px solid rgba(0,242,255,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          backdrop-filter: blur(4px);
          transform: translate(-50%, -50%);
          transition: transform 0.08s ease-out;
        }

        /* Page */
        .mo-page {
          background-color: #050507;
          color: #f0f0f2;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        /* Noise canvas background */
        .mo-canvas {
          position: fixed;
          inset: 0; z-index: 0;
          opacity: 0.35;
          pointer-events: none;
        }

        /* Content above canvas */
        .mo-content { position: relative; z-index: 1; }

        /* ── HERO ── */
        .mo-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 5vw;
          padding-top: 120px;
          max-width: 1300px;
          margin: 0 auto;
        }

        .mo-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #444;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .mo-eyebrow::before {
          content: '';
          width: 36px; height: 1px;
          background: linear-gradient(90deg, #00f2ff, transparent);
        }

        .mo-h1 {
          font-size: clamp(3.5rem, 9vw, 8rem);
          font-weight: 700;
          line-height: 0.92;
          letter-spacing: -0.04em;
          margin-bottom: 48px;
          background: linear-gradient(135deg, #e0e0e0 0%, #888891 50%, #d1d1d6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        /* Ghost echo */
        .mo-h1::after {
          content: attr(data-text);
          position: absolute;
          left: 3px; top: 3px; z-index: -1;
          background: transparent;
          -webkit-text-fill-color: rgba(255,255,255,0.04);
        }

        /* Stats row */
        .mo-stats {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .mo-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.2rem;
          font-weight: 500;
          color: #fff;
          line-height: 1;
        }

        .mo-stat-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #444;
          margin-top: 6px;
        }

        /* ── PILLARS ── */
        .mo-pillars {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 5vw 160px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        .mo-card {
          background: rgba(255,255,255,0.02);
          border: none;
          padding: 56px 48px;
          position: relative;
          overflow: hidden;
          transition: background 0.4s ease, transform 0.3s ease;
          outline: 1px solid rgba(255,255,255,0.06);
        }

        .mo-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, #00f2ff, transparent 60%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
        }

        .mo-card:hover { background: rgba(255,255,255,0.04); }
        .mo-card:hover::before { transform: scaleX(1); }

        /* Shimmer sweep */
        .mo-card::after {
          content: '';
          position: absolute;
          top: -50%; left: -100%;
          width: 60%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s ease;
        }
        .mo-card:hover::after { left: 160%; }

        .mo-card-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: #00f2ff;
          letter-spacing: 0.1em;
          margin-bottom: 18px;
          opacity: 0.6;
        }

        .mo-card-head {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 16px;
        }

        .mo-card-body {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.7;
          font-weight: 300;
        }

        /* ── TEAM ── */
        .mo-team-wrap {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 5vw 160px;
        }

        .mo-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #333;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 48px;
        }

        .mo-section-label::before {
          content: '';
          width: 36px; height: 1px;
          background: linear-gradient(90deg, #00f2ff, transparent);
        }

        .mo-team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: rgba(255,255,255,0.06);
        }

        .mo-member {
          background: #050507;
          padding: 40px 32px;
          height: 420px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
          transition: background 0.35s ease;
        }

        .mo-member:hover { background: #0b0b0e; }

        .mo-member-diamond {
          position: absolute;
          top: 40px; right: 36px;
          width: 80px; height: 80px;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          opacity: 0.25;
          filter: blur(8px);
          transition: all 0.6s cubic-bezier(0.23,1,0.32,1);
        }

        .mo-member:hover .mo-member-diamond {
          opacity: 0.85;
          filter: blur(0);
          transform: rotate(90deg) scale(1.1);
        }

        .mo-member-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.1em;
          margin-bottom: 14px;
        }

        .mo-member-name {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f0f0f2;
          margin-bottom: 4px;
        }

        .mo-member-role {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #333;
        }

        /* ── MISSION CTA ── */
        .mo-mission {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 5vw 160px;
        }

        .mo-mission-box {
          position: relative;
          padding: 80px 64px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(0,242,255,0.04) 0%, transparent 60%);
          border: 1px solid rgba(0,242,255,0.1);
        }

        .mo-mission-box::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 80px; height: 2px;
          background: linear-gradient(90deg, #00f2ff, transparent);
        }

        .mo-mission-box::after {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 2px; height: 80px;
          background: linear-gradient(180deg, #00f2ff, transparent);
        }

        .mo-mission-h {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #fff;
          margin-bottom: 24px;
        }

        .mo-mission-h em { font-style: normal; color: #00f2ff; }

        .mo-mission-p {
          font-size: 1rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.75;
          font-weight: 300;
          max-width: 560px;
        }

        /* ── SCROLL REVEAL ── */
        .mo-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1),
                      transform 0.9s cubic-bezier(0.23,1,0.32,1);
        }

        .mo-reveal.mo-active {
          opacity: 1;
          transform: translateY(0);
        }

        .mo-d1 { transition-delay: 0.05s; }
        .mo-d2 { transition-delay: 0.15s; }
        .mo-d3 { transition-delay: 0.25s; }
        .mo-d4 { transition-delay: 0.35s; }

        @media (max-width: 900px) {
          .mo-pillars { grid-template-columns: 1fr; }
          .mo-team-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 600px) {
          .mo-team-grid { grid-template-columns: 1fr; }
          .mo-h1 { font-size: 3.2rem; }
          .mo-mission-box { padding: 48px 32px; }
          .mo-card { padding: 40px 28px; }
        }
      `}</style>

      {/* Custom cursor */}
      <div className="mo-cursor" ref={cursorRef} />

      <div className="mo-page">

        {/* SVG Noise Canvas */}
        <svg className="mo-canvas" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="mo-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" />
            </filter>
            <linearGradient id="mo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#1a1a1c" />
              <stop offset="50%"  stopColor="#2a2a2e" />
              <stop offset="100%" stopColor="#121214" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mo-grad)" filter="url(#mo-noise)" />
        </svg>

        <div className="mo-content">

          {/* ── HERO ── */}
          <section className="mo-hero">
            <div className="mo-eyebrow mo-reveal">Architects of Motion</div>
            <h1
              className="mo-h1 mo-reveal mo-d1"
              data-text="DRIVEN BY EXCELLENCE."
            >
              DRIVEN BY<br />EXCELLENCE.
            </h1>
            <p
              className="mo-reveal mo-d2"
              style={{ maxWidth: 560, color: "rgba(255,255,255,0.3)", fontSize: "1rem", lineHeight: 1.75, fontWeight: 300 }}
            >
              Founded to make the world's most extraordinary vehicles accessible — DriveX curates
              premium machines for drivers who understand that the journey is the destination.
            </p>
            <div className="mo-stats mo-reveal mo-d3">
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="mo-stat-val">{s.val}</div>
                  <div className="mo-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── PILLARS ── */}
          <section className="mo-pillars">
            {PILLARS.map((p, i) => (
              <div key={p.id} className={`mo-card mo-reveal mo-d${(i % 4) + 1}`}>
                <div className="mo-card-id">{p.id} //</div>
                <div className="mo-card-head">{p.heading}</div>
                <div className="mo-card-body">{p.body}</div>
              </div>
            ))}
          </section>

          {/* ── TEAM ── */}
          <section className="mo-team-wrap">
            <div className="mo-section-label mo-reveal">The Collective</div>
            <div className="mo-team-grid">
              {TEAM.map((m, i) => (
                <div key={i} className={`mo-member mo-reveal mo-d${i + 1}`}>
                  <div
                    className="mo-member-diamond"
                    style={{ background: `linear-gradient(${m.gradient})` }}
                  />
                  <div className="mo-member-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="mo-member-name">{m.name}</div>
                  <div className="mo-member-role">{m.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── MISSION ── */}
          <section className="mo-mission">
            <div className="mo-mission-box mo-reveal">
              <h2 className="mo-mission-h">
                OUR MISSION IS TO<br />
                <em>INSPIRE EVERY JOURNEY.</em>
              </h2>
              <p className="mo-mission-p">
                We believe the vehicle you choose is an extension of who you are. From a coastal
                sprint to a cross-city escape, DriveX ensures the perfect machine meets you at the
                right moment — every time.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
                <a
                  href="/cars"
                  className="mo-cta-primary"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#00f2ff", color: "#030303",
                    padding: "13px 28px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    textDecoration: "none",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#40f8ff";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 24px rgba(0,242,255,0.35)";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#00f2ff";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                  }}
                >
                  Explore Fleet →
                </a>
                <a
                  href="/contact"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    padding: "13px 28px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    textDecoration: "none",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  Contact Us
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
