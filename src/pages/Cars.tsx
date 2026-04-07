import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { formatCurrency } from "../lib/utils";

export default function Cars() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("All");
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cars"));
        const carData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Car))
          .sort((a, b) => a.pricePerDay - b.pricePerDay);
        setAllCars(carData);
        setCars(carData);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Filter when type changes
  useEffect(() => {
    if (selectedType === "All") {
      setCars(allCars);
    } else {
      setCars(allCars.filter(c => c.type === selectedType));
    }
  }, [selectedType, allCars]);

  // Mouse parallax for blobs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobsRef.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 15;
          const offsetX = Math.min(Math.max(x * speed, -30), 30);
          const offsetY = Math.min(Math.max(y * speed, -30), 30);
          blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection observer for card reveal on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);

    document.querySelectorAll(".car-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#050505]"></div>;
  }

  return (
    <>
      <style>{`
        :root {
          --onyx-deep: #050505;
          --onyx-surface: #0a0a0a;
          --onyx-fluid: #121212;
          --mercury: #e0e0e0;
          --viscous-ease: cubic-bezier(0.23, 1, 0.32, 1);
        }

        .cars-body {
          background-color: var(--onyx-deep);
          color: var(--mercury);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          animation: pageSlideIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          width: 100%;
        }

        @keyframes pageSlideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .liquid-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          filter: blur(80px);
          opacity: 0.6;
          overflow: hidden;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          background: linear-gradient(45deg, #1a1a1a, #000);
          border-radius: 50%;
          animation: drift 20s infinite alternate var(--viscous-ease);
        }

        @keyframes drift {
          from { transform: translate(-10%, -10%) scale(1); }
          to { transform: translate(20%, 20%) scale(1.2); }
        }

        .cars-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 60px;
          position: relative;
          z-index: 5;
          width: 100%;
          overflow: visible;
        }

        .cars-h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          line-height: 0.9;
          margin-bottom: 80px;
          letter-spacing: -4px;
          background: linear-gradient(180deg, #fff 0%, #333 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textFadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }

        @keyframes textFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .car-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 60px 40px;
          animation: gridFadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }

        @keyframes gridFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .car-card {
          grid-column: span 6;
          position: relative;
          cursor: pointer;
          transition: transform 0.6s var(--viscous-ease);
          animation: cardSlideIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }

        .car-card:nth-child(1) { animation-delay: 0.1s; }
        .car-card:nth-child(2) { animation-delay: 0.2s; }
        .car-card:nth-child(3) { animation-delay: 0.3s; }
        .car-card:nth-child(4) { animation-delay: 0.4s; }
        .car-card:nth-child(5) { animation-delay: 0.5s; }
        .car-card:nth-child(6) { animation-delay: 0.6s; }
        .car-card:nth-child(n+7) { animation-delay: 0.7s; }

        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .car-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .car-card:nth-child(even) {
          margin-top: 120px;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
        }

        .image-wrapper-link {
          display: block;
          text-decoration: none;
          position: relative;
          cursor: pointer;
        }

        .image-wrapper-link::after {
          content: 'VIEW SPEC';
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          letter-spacing: 5px;
          opacity: 0;
          transition: all 0.4s ease;
          pointer-events: none;
          color: var(--mercury);
          font-weight: 700;
          z-index: 10;
        }

        .image-wrapper-link:hover::after {
          opacity: 1;
          top: 45%;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1) brightness(0.7);
          transition: all 0.8s var(--viscous-ease);
        }

        .image-wrapper-link:hover .image-wrapper img {
          transform: scale(1.05);
          filter: grayscale(0) brightness(0.9);
        }

        .car-info {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .car-title h3 {
          font-size: 1.5rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -1px;
          margin-bottom: 10px;
        }

        .specs {
          display: flex;
          gap: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
        }

        .specs span {
          color: var(--mercury);
        }

        .book-btn {
          background: transparent;
          border: 1px solid rgba(0,242,255,0.2);
          color: rgba(255,255,255,0.6);
          padding: 14px 28px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          position: relative;
          overflow: hidden;
          transition: color 0.4s ease, border-color 0.4s ease;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          border-radius: 2px;
        }

        .book-btn::before {
          content: '';
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: #00f2ff;
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
          z-index: -1;
        }

        .book-btn:hover {
          color: #000;
          border-color: #00f2ff;
        }

        .book-btn:hover::before {
          transform: translateY(-100%);
        }

        @media (max-width: 900px) {
          .car-card { grid-column: span 12; }
          .car-card:nth-child(even) { margin-top: 0; }
          .cars-header { padding: 20px; }
          .cars-container { padding: 40px 20px; padding-bottom: 140px; /* Space for mobile nav */ }
          .nav-links { display: none; }
        }

        @media (max-width: 768px) {
          .cars-h1 {
            font-size: 2.5rem;
            margin-bottom: 40px;
          }
          .car-grid {
            gap: 40px 0;
          }
          .car-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .book-btn {
            width: 100%;
            text-align: center;
          }
          .filter-bar {
            margin-bottom: 30px;
          }
        }

        /* ═══ FILTER BAR ═══ */
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 60px;
          align-items: center;
        }

        .filter-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #333;
          margin-right: 6px;
          white-space: nowrap;
        }

        .filter-pill {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35);
          padding: 7px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.25s ease;
          outline: none;
        }

        .filter-pill:hover {
          border-color: rgba(0,242,255,0.35);
          color: rgba(255,255,255,0.7);
        }

        .filter-pill.active {
          border-color: #00f2ff;
          color: #00f2ff;
          background: rgba(0,242,255,0.07);
          box-shadow: 0 0 12px rgba(0,242,255,0.12);
        }

        .filter-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          color: #333;
          margin-left: auto;
          letter-spacing: 0.08em;
        }

        .no-results {
          grid-column: span 12;
          padding: 80px 0;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #222;
        }
      `}</style>

      <div className="cars-body">
        <div className="liquid-bg">
          <div
            ref={(el) => blobsRef.current[0] = el}
            className="blob"
            style={{ width: "600px", height: "600px", top: "-100px", right: "-100px" }}
          ></div>
          <div
            ref={(el) => blobsRef.current[1] = el}
            className="blob"
            style={{
              width: "400px",
              height: "400px",
              bottom: "0",
              left: "-100px",
              background: "linear-gradient(45deg, #0a0a0a, #151515)",
            }}
          ></div>
        </div>

        <main className="cars-container">
          <section>
            <h1 className="cars-h1">Fluid<br />Dynamics</h1>
          </section>

          {/* ── Filter Bar ── */}
          <div className="filter-bar">
            <span className="filter-label">Type //</span>
            {["All", ...Array.from(new Set(allCars.map(c => c.type))).sort()].map(type => (
              <button
                key={type}
                className={`filter-pill ${selectedType === type ? "active" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
            <span className="filter-count">{cars.length} vehicle{cars.length !== 1 ? "s" : ""}</span>
          </div>

          <section className="car-grid">
            {cars.map((car) => (
              <article key={car.id} className="car-card">
                <Link to={`/cars/${car.id}`} className="image-wrapper-link">
                  <div className="image-wrapper">
                    <img
                      src={car.image}
                      alt={car.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200";
                      }}
                    />
                  </div>
                </Link>
                <div className="car-info">
                  <div className="car-title">
                    <div className="specs">
                      TYPE <span>{car.type}</span> • {new Date().getFullYear()}
                    </div>
                    <h3>{car.name}</h3>
                    <div className="specs">
                      BRAND <span>{car.brand}</span> • PRICE <span>{formatCurrency(car.pricePerDay)}/day</span>
                    </div>
                  </div>
                  <Link to={`/booking/${car.id}`} className="book-btn">
                    Book Drive
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
