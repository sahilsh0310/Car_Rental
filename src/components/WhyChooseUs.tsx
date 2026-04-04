import { useEffect, useRef } from "react";

const features = [
  {
    number: "01",
    title: "PREMIUM INSURANCE",
    description: "Fully comprehensive insurance coverage for every rental, giving you total peace of mind on the road."
  },
  {
    number: "02",
    title: "INSTANT BOOKING",
    description: "Our seamless digital platform allows you to book your dream car in less than 60 seconds."
  },
  {
    number: "03",
    title: "24/7 CONCIERGE",
    description: "Dedicated support team available around the clock to assist with any requests during your journey."
  },
  {
    number: "04",
    title: "TRANSPARENT PRICING",
    description: "No hidden fees. What you see is what you pay, with flexible payment options including crypto."
  }
];

export default function WhyChooseUs() {
  const carContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carStage = carContainerRef.current;
    if (!carStage) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 150;
      const y = (window.innerHeight / 2 - e.pageY) / 150;
      carStage.style.transform = `perspective(1000px) rotateY(${-15 + x}deg) rotateX(${y}deg)`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        :root {
          --bg-deep: #050505;
          --carbon-base: #0a0a0a;
          --prismatic-1: #00f2ff;
          --prismatic-2: #7000ff;
          --prismatic-3: #ff00c8;
          --text-main: #e0e0e0;
          --text-muted: #888888;
          --carbon-pattern: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
        }

        .why-choose-section {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 4rem 8%;
          gap: 4rem;
          background-color: var(--bg-deep);
        }

        .carbon-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: var(--carbon-pattern);
          background-size: 30px 30px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }

        .features-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mono-tag {
          font-family: 'Space Mono', 'Courier New', monospace;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: var(--prismatic-1);
          margin-bottom: 1rem;
          display: inline-block;
        }

        .main-title {
          font-family: 'Syncopate', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: 0.9;
          margin-bottom: 3rem;
          background: linear-gradient(to right, #fff, #666);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
        }

        .feature-tile {
          position: relative;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem 2rem;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 1.5rem;
        }

        .feature-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            rgba(0, 242, 255, 0.05), 
            rgba(112, 0, 255, 0.05), 
            transparent
          );
          transition: 0.8s;
        }

        .feature-tile:hover::before {
          left: 100%;
        }

        .feature-tile:hover {
          transform: translateX(15px);
          background: rgba(30, 30, 30, 0.8);
          border-color: rgba(0, 242, 255, 0.3);
          box-shadow: -10px 0 30px rgba(0, 242, 255, 0.1);
        }

        .tile-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          font-family: 'Space Mono', monospace;
          font-size: 0.9rem;
          transition: 0.4s;
          font-weight: bold;
        }

        .feature-tile:hover .tile-icon {
          background: var(--prismatic-1);
          color: #000;
          box-shadow: 0 0 20px var(--prismatic-1);
          border-color: var(--prismatic-1);
        }

        .tile-info h3 {
          font-family: 'Syncopate', sans-serif;
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .tile-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .image-stage {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .car-container {
          position: relative;
          width: 120%;
          transform: perspective(1000px) rotateY(-15deg);
          transition: 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .car-container:hover {
          transform: perspective(1000px) rotateY(-5deg) scale(1.05);
        }

        .main-car-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 0 50px rgba(112, 0, 255, 0.2));
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }

        .prismatic-fluid {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 60%;
          background: linear-gradient(
            45deg,
            var(--prismatic-1),
            var(--prismatic-2),
            var(--prismatic-3),
            var(--prismatic-1)
          );
          background-size: 300% 300%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: -1;
          animation: fluidMove 10s infinite alternate;
          border-radius: 50%;
        }

        @keyframes fluidMove {
          0% { background-position: 0% 50%; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          100% { background-position: 100% 50%; border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
        }

        .refraction-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.05) 45%, transparent 60%);
          pointer-events: none;
          animation: sweep 6s infinite;
        }

        @keyframes sweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }

        .floating-data {
          position: absolute;
          bottom: 10%;
          right: 0;
          font-family: 'Space Mono', monospace;
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          border-left: 3px solid var(--prismatic-2);
          backdrop-filter: blur(10px);
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .data-label {
          display: block;
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
        }

        .data-value {
          font-size: 1.1rem;
          color: #fff;
        }

        @media (max-width: 1024px) {
          .why-choose-section {
            grid-template-columns: 1fr;
            padding: 6rem 5%;
          }
          .car-container {
            width: 100%;
            transform: none;
            margin-top: 4rem;
          }
          .car-container:hover {
            transform: scale(1.02);
          }
        }
      `}</style>

      <div className="carbon-overlay"></div>

      <section className="why-choose-section">
        {/* LEFT CONTENT */}
        <div className="features-content">
          <header>
            <span className="mono-tag">// WHY_DRIVEX</span>
            <h1 className="main-title">
              REDEFINING<br />THE RENTAL
            </h1>
          </header>

          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-tile"
              style={{ transitionDelay: `${(i + 1) * 0.1}s` }}
            >
              <div className="tile-icon">{feature.number}</div>
              <div className="tile-info">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="image-stage">
          <div className="prismatic-fluid"></div>
          <div className="car-container" ref={carContainerRef}>
            <div className="refraction-overlay"></div>
            <img
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop"
              alt="Aerodynamic Sports Car"
              className="main-car-img"
              referrerPolicy="no-referrer"
            />

            <div className="floating-data">
              <span className="data-label">DRAG_COEFFICIENT</span>
              <span className="data-value">0.19 CD</span>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0.5rem 0" }}></div>
              <span className="data-label">PEAK_OUTPUT</span>
              <span className="data-value">1,420 KW</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
