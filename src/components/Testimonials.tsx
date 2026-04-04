import { useEffect, useRef } from "react";

const testimonials = [
  {
    quote: "The interface doesn't just respond; it shatters expectations of speed and fluidity.",
    name: "James Wilson",
    role: "CEO, DriveX",
    initials: "J1"
  },
  {
    quote: "A monolithic approach to design that feels carved from a single block of digital obsidian.",
    name: "Elena Rodriguez",
    role: "Lead Designer",
    initials: "M9"
  },
  {
    quote: "Refining the brutalist aesthetic into something sharp, high-fidelity, and purely functional.",
    name: "Marcus Chen",
    role: "Creative Director",
    initials: "S5"
  }
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const cards = containerRef.current.querySelectorAll(".plateau-card");
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;

      cards.forEach((card, index) => {
        const depth = (index + 1) * 0.5;
        (card as HTMLElement).style.transform = `translate(${x * depth}px, ${y * depth}px) rotateX(${-y}deg) rotateY(${x}deg)`;
      });
    };

    const handleMouseLeave = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll(".plateau-card");
      cards.forEach((card) => {
        (card as HTMLElement).style.transform = "translate(0, 0) rotateX(0) rotateY(0)";
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --obsidian-deep: #050505;
          --obsidian-surface: #121214;
          --obsidian-edge: #2a2a2e;
          --fracture-cyan: #00f2ff;
          --text-main: #e0e0e0;
          --text-muted: #666666;
          --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        }

        .testimonials-section {
          background-color: var(--obsidian-deep);
          padding: 0 2rem 4rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 4rem;
          max-width: 1200px;
        }

        .testimonials-header h2 {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: #fff;
          line-height: 0.9;
        }

        .testimonials-header .subtitle {
          color: #888;
        }

        .plateau-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          width: 90%;
          perspective: 1000px;
        }

        .plateau-card {
          position: relative;
          background: var(--obsidian-surface);
          padding: 3rem 2rem;
          border: 1px solid var(--obsidian-edge);
          transition: all 0.6s var(--ease-out-expo);
          cursor: pointer;
          overflow: hidden;
          clip-path: polygon(0% 0%, 100% 5%, 95% 95%, 5% 100%);
          animation: revealCard 1s var(--ease-out-expo) forwards;
          opacity: 0;
          display: flex;
          flex-direction: column;
          min-height: 300px;
        }

        .plateau-card:nth-child(1) { animation-delay: 0s; }
        .plateau-card:nth-child(2) {
          animation-delay: 0.1s;
          clip-path: polygon(5% 2%, 95% 0%, 100% 100%, 0% 90%);
          margin-top: -20px;
        }
        .plateau-card:nth-child(3) {
          animation-delay: 0.2s;
          clip-path: polygon(0% 10%, 90% 0%, 100% 90%, 10% 100%);
        }

        @keyframes revealCard {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plateau-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(0, 242, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .fracture-line {
          position: absolute;
          background: var(--fracture-cyan);
          opacity: 0.2;
          transition: all 0.6s var(--ease-out-expo);
        }

        .f-1 { top: 0; left: 20%; width: 1px; height: 100%; transform: skewX(-15deg); }
        .f-2 { bottom: 20%; left: 0; width: 100%; height: 1px; transform: skewY(-5deg); }

        .plateau-card:hover {
          transform: translateY(-12px) scale(1.02) rotateX(2deg) !important;
          border-color: var(--fracture-cyan);
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        }

        .plateau-card:hover::after {
          opacity: 1;
        }

        .plateau-card:hover .fracture-line {
          opacity: 0.8;
          box-shadow: 0 0 15px var(--fracture-cyan);
        }

        .quote-icon {
          font-family: 'JetBrains Mono', monospace;
          color: var(--fracture-cyan);
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          display: block;
          position: relative;
          z-index: 2;
        }

        .review-text {
          font-size: 1.25rem;
          line-height: 1.4;
          font-weight: 800;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 2;
          flex-grow: 1;
        }

        .reviewer-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          position: relative;
          z-index: 2;
        }

        .avatar-shatter {
          width: 40px;
          height: 40px;
          background: var(--obsidian-edge);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          border: 1px solid var(--fracture-cyan);
          font-weight: 700;
          color: var(--fracture-cyan);
        }

        .reviewer-info {
          font-family: 'JetBrains Mono', monospace;
        }

        .name {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .role {
          display: block;
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @media (max-width: 900px) {
          .plateau-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            max-width: 500px;
            margin: 0 auto;
          }
          .plateau-card:nth-child(2) { margin-top: 0; }
        }
      `}</style>

      <section className="testimonials-section">
        <div className="testimonials-header">
          <div className="space-y-2">
            <span style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold", display: "block" }}>
              Testimonials
            </span>
            <h2>
              WHAT OUR <br /> <span className="subtitle">CLIENTS SAY</span>
            </h2>
          </div>
        </div>

        <div className="plateau-container" ref={containerRef}>
          {testimonials.map((item, index) => (
            <div key={index} className="plateau-card">
              <div className="fracture-line f-1"></div>
              <div className="fracture-line f-2" style={index === 1 ? { bottom: "40%" } : {}}></div>
              <span className="quote-icon">// FRACTURE.{String(index + 1).padStart(2, "0")}</span>
              <p className="review-text">"{item.quote}"</p>
              <div className="reviewer-meta">
                <div className="avatar-shatter">{item.initials}</div>
                <div className="reviewer-info">
                  <span className="name">{item.name}</span>
                  <span className="role">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
