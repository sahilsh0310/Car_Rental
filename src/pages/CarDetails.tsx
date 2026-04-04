import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "cars", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCar({ id: docSnap.id, ...docSnap.data() } as Car);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

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

  if (loading) return <div className="min-h-screen bg-[#050505]"></div>;
  if (!car)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Car not found
      </div>
    );

  const allImages = car.images && car.images.length > 0 ? car.images : [car.image];

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

        .details-body {
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

        .details-header {
          padding: 40px 60px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 10;
          flex-direction: column;
          cursor: pointer;
        }

        .details-header:hover {
          color: #666;
        }

        .details-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 60px;
          position: relative;
          z-index: 5;
          width: 100%;
          overflow: visible;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: slideInLeft 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.2s forwards;
          opacity: 0;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .main-image {
          width: 100%;
          aspect-ratio: 16/10;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.1) brightness(0.9);
        }

        .thumbnail-row {
          display: flex;
          gap: 15px;
          overflow-x: auto;
        }

        .thumbnail {
          width: 120px;
          height: 80px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .thumbnail.active {
          border-color: var(--mercury);
          box-shadow: 0 0 20px rgba(224,224,224,0.2);
        }

        .thumbnail.active img {
          filter: grayscale(0);
        }

        .detail-info {
          display: flex;
          flex-direction: column;
          gap: 50px;
          animation: slideInRight 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s forwards;
          opacity: 0;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .car-title h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .car-meta {
          display: flex;
          gap: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .car-description {
          color: #999;
          line-height: 1.8;
          font-size: 1rem;
          max-width: 600px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .spec-item {
          border-left: 1px solid rgba(255,255,255,0.1);
          padding-left: 20px;
        }

        .spec-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #666;
          margin-bottom: 8px;
        }

        .spec-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--mercury);
        }

        .price-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 40px 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .price-info h3 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #666;
          margin-bottom: 12px;
        }

        .price-display {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--mercury);
        }

        .price-display span {
          font-size: 0.8rem;
          color: #666;
          margin-left: 8px;
        }

        .book-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--mercury);
          padding: 15px 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .book-btn::before {
          content: '';
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--mercury);
          transition: transform 0.6s var(--viscous-ease);
          z-index: -1;
        }

        .book-btn:hover {
          color: var(--onyx-deep);
          border-color: var(--mercury);
        }

        .book-btn:hover::before {
          transform: translateY(-100%);
        }

        @media (max-width: 900px) {
          .details-grid { grid-template-columns: 1fr; gap: 40px; }
          .details-container { padding: 40px 20px; }
          .car-title h1 { font-size: 2.5rem; }
          .specs-grid { grid-template-columns: 1fr; }
          .details-header { padding: 20px; }
        }
      `}</style>

      <div className="details-body">
        <div className="liquid-bg">
          <div
            ref={(el) => (blobsRef.current[0] = el)}
            className="blob"
            style={{ width: "600px", height: "600px", top: "-100px", right: "-100px" }}
          ></div>
          <div
            ref={(el) => (blobsRef.current[1] = el)}
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

        <header
          className="details-header"
          onClick={() => navigate(-1)}
          title="Back to Fleet"
        >
          <ArrowLeft className="w-5 h-5" />
        </header>

        <main className="details-container">
          <section className="details-grid">
            <div className="image-gallery">
              <div className="main-image">
                <img
                  src={allImages[activeImage]}
                  alt={car.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
              </div>
              <div className="thumbnail-row">
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className={`thumbnail ${activeImage === i ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-info">
              <div>
                <div className="car-meta">
                  <span>{car.type}</span> • {new Date().getFullYear()}
                </div>
                <div className="car-title">
                  <h1>{car.name}</h1>
                </div>
                <p className="car-description">{car.description}</p>
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <div className="spec-label">Transmission</div>
                  <div className="spec-value">{car.specs.transmission}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Fuel Type</div>
                  <div className="spec-value">{car.specs.fuelType}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Seats</div>
                  <div className="spec-value">{car.specs.seats}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Engine</div>
                  <div className="spec-value">{car.specs.engine}</div>
                </div>
              </div>

              <div className="price-section">
                <div className="price-info">
                  <h3>Price Per Day</h3>
                  <div className="price-display">
                    {formatCurrency(car.pricePerDay)}
                    <span>/ day</span>
                  </div>
                </div>
                <Link to={`/booking/${car.id}`} className="book-btn">
                  Book Drive
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
