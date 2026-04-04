import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import { Link } from "react-router-dom";

export default function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "cars"), where("isFeatured", "==", true), limit(3));
        const snapshot = await getDocs(q);
        const carData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Car));
        setCars(carData);
      } catch (error) {
        console.error("Error fetching featured cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    // Parallax tilt effect
    cardsRef.current.forEach((card) => {
      if (!card) return;

      card.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) translateY(0) rotateX(0) rotateY(0)`;
      });
    });
  }, [cars]);

  if (loading) return null;

  return (
    <>
      <style>{`
        :root {
          --obsidian-deep: #050506;
          --obsidian-plate: #121214;
          --obsidian-edge: #2a2a2e;
          --magma-glow: #ff4d00;
          --tectonic-silver: #a1a1aa;
          --glass-shine: rgba(255, 255, 255, 0.03);
          --transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .featured-section {
          background-color: var(--obsidian-deep);
          padding: 4rem 2rem;
          position: relative;
        }

        .featured-header {
          max-width: 1200px;
          margin: 0 auto 4rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--obsidian-edge);
          transition: var(--transition);
          border-radius: 2px;
        }

        .view-all-btn:hover {
          border-color: var(--magma-glow);
          color: var(--magma-glow);
          transform: translateX(4px);
        }

        .featured-header h2 {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: #fff;
          line-height: 0.9;
        }

        .featured-header .subtitle {
          color: #888;
        }

        .fleet-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .plate-card {
          position: relative;
          background: var(--obsidian-plate);
          border: 1px solid var(--obsidian-edge);
          padding: 0;
          overflow: hidden;
          transition: var(--transition);
          clip-path: polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%);
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        .plate-card:nth-child(1) { animation-delay: 0.1s; }
        .plate-card:nth-child(2) { animation-delay: 0.2s; }
        .plate-card:nth-child(3) { animation-delay: 0.3s; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plate-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.05),
              transparent
          );
          transition: 0.8s;
          z-index: 2;
          pointer-events: none;
        }

        .plate-card:hover::before {
          left: 150%;
        }

        .plate-card:hover {
          border-color: rgba(255, 77, 0, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .image-module {
          position: relative;
          height: 240px;
          overflow: hidden;
          background: #000;
        }

        .image-module img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%) contrast(1.2);
          transition: var(--transition);
          opacity: 0.7;
        }

        .plate-card:hover .image-module img {
          filter: grayscale(0%) contrast(1.1);
          transform: scale(1.05);
          opacity: 1;
        }

        .overlay-id {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--tectonic-silver);
          background: rgba(0,0,0,0.8);
          padding: 4px 8px;
          z-index: 3;
          border-left: 2px solid var(--magma-glow);
        }

        .content-plate {
          padding: 2rem;
          position: relative;
        }

        .content-plate h2 {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .content-plate .category {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--magma-glow);
          margin-bottom: 1.5rem;
          display: block;
          text-transform: uppercase;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          border-top: 1px solid var(--obsidian-edge);
          padding-top: 1rem;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
        }

        .spec-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--tectonic-silver);
          text-transform: uppercase;
        }

        .spec-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #eee;
        }

        .action-tray {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1px;
          background: var(--obsidian-edge);
          margin: 0 -2rem -2rem -2rem;
        }

        .btn {
          padding: 1.25rem;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-buy {
          background: #fff;
          color: #000;
        }

        .btn-buy:hover {
          background: var(--magma-glow);
          color: #fff;
        }

        .btn-spec {
          background: var(--obsidian-plate);
          color: var(--tectonic-silver);
          font-family: 'JetBrains Mono', monospace;
        }

        .btn-spec:hover {
          background: var(--obsidian-edge);
          color: #fff;
        }

        @media (max-width: 1024px) {
          .fleet-container {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }
        }
      `}</style>

      <section className="featured-section">
        <div className="featured-header">
          <div className="space-y-2">
            <span style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold", display: "block" }}>
              Our Collection
            </span>
            <h2>
              FEATURED <br /> <span className="subtitle">FLEET</span>
            </h2>
          </div>
          <Link to="/cars" className="view-all-btn">
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 12l6-6M12 6H6v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="fleet-container">
          {cars.map((car, index) => (
            <article
              key={car.id}
              className="plate-card"
              ref={(el) => (cardsRef.current[index] = el)}
            >
              <div className="image-module">
                <span className="overlay-id">Unit // {String(index + 1).padStart(2, "0")}-{car.brand.charAt(0).toUpperCase()}</span>
                <img
                  src={car.image}
                  alt={car.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
              </div>
              <div className="content-plate">
                <span className="category">{car.type}</span>
                <h2>{car.name}</h2>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">{car.brand}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Price/Day</span>
                    <span className="spec-value">${car.pricePerDay}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{car.specs.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel</span>
                    <span className="spec-value">{car.specs.fuelType}</span>
                  </div>
                </div>
                <div className="action-tray">
                  <Link to={`/booking/${car.id}`} className="btn btn-buy">
                    Book Now
                  </Link>
                  <Link to={`/cars/${car.id}`} className="btn btn-spec">
                    Specs
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
