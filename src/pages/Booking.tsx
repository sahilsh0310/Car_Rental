import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Car, Booking as BookingType } from "../types";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { differenceInDays, parseISO } from "date-fns";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ location, setLocation, defaultCenter }: { location: string, setLocation: (loc: string) => void, defaultCenter: [number, number] }) => {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleLocation(e.latlng);
      },
      locationfound(e) {
        handleLocation(e.latlng);
        const map = e.target;
        map.flyTo(e.latlng, map.getZoom());
      },
      locationerror(e) {
        alert("Location access denied or unavailable. Please ensure you have granted location permissions within your browser settings.");
      }
    });

    const handleLocation = (latlng: any) => {
      setPosition(latlng);
      setLocation("Loading map data...");
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`, {
        headers: { 'User-Agent': 'CarRentalApp/1.0' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
          }
        })
        .catch(() => setLocation(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`));
    };

    return null;
  };

  const LocateControl = () => {
    const map = useMap();
    const btnRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (btnRef.current) {
        L.DomEvent.disableClickPropagation(btnRef.current);
      }
    }, []);
    return (
      <button
        ref={btnRef}
        type="button"
        title="Find my location"
        onClick={(e) => {
          e.preventDefault();
          map.locate({ setView: true, maxZoom: 16 });
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: '#0c0f14',
          border: '1px solid rgba(0,242,255,0.4)',
          color: '#00f2ff',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        LOCATE ME
      </button>
    );
  };

  return (
    <div style={{ height: "300px", width: "100%", marginTop: "15px", borderRadius: "4px", overflow: "hidden", zIndex: 0, position: "relative" }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && <Marker position={position} />}
        <MapEvents />
        <LocateControl />
      </MapContainer>
    </div>
  );
};

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success">("idle");
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);

  const initDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]);

  const [formData, setFormData] = useState({
    pickupDate: initDate,
    dropoffDate: "",
    pickupLocation: "",
    driverName: "",
    licenseNumber: "",
    paymentMethod: "stripe", // stripe, crypto, cash, or upi
    cardNumber: "",
    expiry: "",
    cvv: "",
    discountCode: "",
    upiId: "",
  });

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

  const getPricing = () => {
    if (!car || !formData.pickupDate || !formData.dropoffDate) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    const days = Math.max(1, differenceInDays(parseISO(formData.dropoffDate), parseISO(formData.pickupDate)));
    const subtotal = days * car.pricePerDay;
    const discount = formData.discountCode.toUpperCase() === "DRIVEX10" ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.18;
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car) return;

    setBookingStatus("submitting");
    try {
      const { discount, tax, total } = getPricing();
      const bookingData: Omit<BookingType, "id"> = {
        userId: user.uid,
        userEmail: user.email || "unknown@domain.com",
        carId: car.id,
        carName: car.name,
        carBrand: car.brand,
        carImage: car.image,
        pickupDate: formData.pickupDate,
        dropoffDate: formData.dropoffDate,
        pickupLocation: formData.pickupLocation,
        totalPrice: total,
        discountAmount: discount,
        taxAmount: tax,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        driverName: formData.driverName || user?.displayName || "Unknown",
      } as any; // Cast as any to bypass strict type for new fields

      await addDoc(collection(db, "bookings"), {
        ...bookingData,
        createdAt: serverTimestamp(),
      });

      setBookingStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus("idle");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505]"></div>;
  if (!car) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Car not found</div>;

  if (bookingStatus === "success") {
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

          .booking-body {
            background-color: var(--onyx-deep);
            color: var(--mercury);
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
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

          .success-card {
            background: rgba(10, 30, 60, 0.3);
            border: 1px solid rgba(224, 224, 224, 0.1);
            border-radius: 2px;
            padding: 60px 40px;
            max-width: 500px;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .success-icon {
            width: 80px;
            height: 80px;
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
          }

          .success-icon svg {
            width: 40px;
            height: 40px;
            color: #22c55e;
          }

          .success-title {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 20px;
          }

          .success-text {
            color: #999;
            line-height: 1.6;
          }
        `}</style>

        <div className="booking-body">
          <div className="liquid-bg">
            <div
              className="blob"
              style={{ width: "600px", height: "600px", top: "-100px", right: "-100px" }}
            ></div>
            <div
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

          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 />
            </div>
            <h2 className="success-title">BOOKING CONFIRMED!</h2>
            <p className="success-text">
              Your luxury ride is ready. We've sent the details to your email. Redirecting you home...
            </p>
          </div>
        </div>
      </>
    );
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

        .booking-body {
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

        .booking-header {
          padding: 40px 60px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 10;
          cursor: pointer;
        }

        .booking-header:hover {
          color: #666;
        }

        .booking-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 60px;
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          width: 100%;
          overflow: visible;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 50px;
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

        .form-title h1 {
          font-size: 3rem;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -2px;
          text-transform: uppercase;
          margin-bottom: 15px;
        }

        .form-description {
          color: #999;
          line-height: 1.6;
          max-width: 600px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #666;
        }

        .form-input,
        .form-select {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--mercury);
          padding: 15px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--mercury);
          box-shadow: 0 0 20px rgba(224,224,224,0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .submit-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--mercury);
          padding: 20px 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease;
          margin-top: 20px;
        }

        .submit-btn::before {
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

        .submit-btn:hover {
          color: var(--onyx-deep);
          border-color: var(--mercury);
        }

        .submit-btn:hover::before {
          transform: translateY(-100%);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Payment Selector */
        .payment-options {
          display: flex;
          gap: 15px;
        }

        .payment-option {
          flex: 1;
          padding: 15px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          text-align: center;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #666;
          transition: all 0.3s ease;
        }

        .payment-option.active {
          border-color: #00f2ff;
          color: #00f2ff;
          background: rgba(0,242,255,0.05);
          box-shadow: 0 0 15px rgba(0,242,255,0.1);
        }

        .summary-section {
          display: flex;
          flex-direction: column;
          gap: 30px;
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

        .summary-card {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          padding: 40px;
          background: rgba(10, 10, 10, 0.5);
          backdrop-filter: blur(10px);
        }

        .summary-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .car-preview {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .car-preview-image {
          width: 100px;
          height: 100px;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .car-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .car-preview-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .car-preview-brand {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #666;
        }

        .car-preview-name {
          font-weight: 700;
          font-size: 1rem;
        }

        .car-preview-type {
          font-size: 0.75rem;
          color: #666;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .summary-line:last-of-type {
          border-bottom: none;
        }

        .summary-label {
          color: #666;
        }

        .summary-value {
          font-weight: 600;
        }

        .total-price {
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .guarantee-box {
          background: rgba(30, 80, 150, 0.1);
          border: 1px solid rgba(100, 150, 200, 0.2);
          border-radius: 2px;
          padding: 20px;
          font-size: 0.75rem;
          color: #aaa;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .booking-container { grid-template-columns: 1fr; gap: 40px; }
          .form-row { grid-template-columns: 1fr; }
          .booking-header { padding: 20px; }
          .booking-container { padding: 40px 20px; }
          .form-title h1 { font-size: 2.2rem; }
        }
      `}</style>

      <div className="booking-body">
        <div className="liquid-bg">
          <div
            ref={(el) => { blobsRef.current[0] = el; }}
            className="blob"
            style={{ width: "600px", height: "600px", top: "-100px", right: "-100px" }}
          ></div>
          <div
            ref={(el) => { blobsRef.current[1] = el; }}
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
          className="booking-header"
          onClick={() => navigate(-1)}
          title="Back to Fleet"
        >
          <ArrowLeft className="w-5 h-5" />
        </header>

        <main className="booking-container">
          <section className="form-section">
            <div>
              <div className="form-title">
                <h1>SECURE YOUR DRIVE</h1>
              </div>
              <p className="form-description">Complete the details below to confirm your booking and finalize your reservation.</p>
            </div>

            <form onSubmit={handleBooking} className="space-y-8">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pickup Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dropoff Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dropoffDate}
                    onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Location</label>
                <input
                  type="text"
                  required
                  placeholder="CLICK MAP OR TYPE ADDRESS"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="form-input"
                />
                <LocationPicker 
                  location={formData.pickupLocation} 
                  setLocation={(loc) => setFormData({ ...formData, pickupLocation: loc })} 
                  defaultCenter={mapCenter}
                />
              </div>

              {/* Driver Details */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. JAMES BOND"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="VALID DRIVER'S ID"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="form-group" style={{ marginTop: "20px" }}>
                <label className="form-label">Payment Method</label>
                <div className="payment-options">
                  <div
                    className={`payment-option ${formData.paymentMethod === "stripe" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "stripe" })}
                  >
                    Credit Card
                  </div>
                  <div
                    className={`payment-option ${formData.paymentMethod === "crypto" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "crypto" })}
                  >
                    Crypto
                  </div>
                  <div
                    className={`payment-option ${formData.paymentMethod === "cash" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "cash" })}
                  >
                    Cash
                  </div>
                  <div
                    className={`payment-option ${formData.paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "upi" })}
                  >
                    UPI
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label className="form-label text-[#00f2ff]">Discount Code</label>
                <div style={{ display: "flex", gap: "15px" }}>
                  <input
                    type="text"
                    placeholder="E.G. DRIVEX10"
                    value={formData.discountCode}
                    onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {formData.paymentMethod === "stripe" && (
                <div className="form-group" style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
                  <label className="form-label" style={{ color: "#00f2ff", marginBottom: "15px" }}>Secure Stripe Checkout Checkout</label>
                  <div className="form-row" style={{ gap: "15px", marginBottom: "15px" }}>
                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <input type="text" placeholder="CARD NUMBER (MOCK)" className="form-input" required value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} maxLength={16} />
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="MM/YY" className="form-input" required value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} maxLength={5} />
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="CVC" className="form-input" required value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value})} maxLength={3} />
                    </div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === "crypto" && (
                <div className="form-group" style={{ padding: "20px", border: "1px dashed rgba(0,242,255,0.4)", background: "rgba(0,242,255,0.02)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#00f2ff", marginBottom: "10px" }}>AWAITING BLOCKCHAIN TRANSFER</div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>A unique wallet address will be generated upon confirmation.</div>
                </div>
              )}

              {formData.paymentMethod === "cash" && (
                <div className="form-group" style={{ padding: "20px", border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#fff", marginBottom: "10px" }}>PAY ON ARRIVAL</div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>Please have the exact cash amount ready upon vehicle pickup.</div>
                </div>
              )}

              {formData.paymentMethod === "upi" && (
                <div className="form-group" style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,242,255,0.02)" }}>
                  <label className="form-label" style={{ color: "#00f2ff", marginBottom: "15px" }}>Pay with UPI</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. user@okhdfcbank"
                    className="form-input"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={bookingStatus === "submitting" || !user}
                className="submit-btn"
              >
                {bookingStatus === "submitting" ? "PROCESSING..." : user ? "CONFIRM BOOKING" : "PLEASE SIGN IN"}
              </button>
            </form>
          </section>

          <section className="summary-section">
            <div className="summary-card">
              <div className="summary-title">Booking Summary</div>

              <div className="car-preview">
                <div className="car-preview-image">
                  <img
                    src={car.image}
                    alt={car.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200";
                    }}
                  />
                </div>
                <div className="car-preview-info">
                  <div className="car-preview-brand">{car.brand}</div>
                  <div className="car-preview-name">{car.name}</div>
                  <div className="car-preview-type">{car.type}</div>
                </div>
              </div>

              <div className="summary-line">
                <span className="summary-label">Daily Rate</span>
                <span className="summary-value">{formatCurrency(car.pricePerDay)}</span>
              </div>

              <div className="summary-line">
                <span className="summary-label">Rental Duration</span>
                <span className="summary-value">
                  {formData.pickupDate && formData.dropoffDate
                    ? `${Math.max(1, differenceInDays(parseISO(formData.dropoffDate), parseISO(formData.pickupDate)))} Days`
                    : "0 Days"}
                </span>
              </div>

              {getPricing().discount > 0 && (
                <div className="summary-line">
                  <span className="summary-label" style={{ color: "#00f2ff" }}>Discount ({formData.discountCode})</span>
                  <span className="summary-value" style={{ color: "#00f2ff" }}>-{formatCurrency(getPricing().discount)}</span>
                </div>
              )}

              <div className="summary-line">
                <span className="summary-label">Insurance (Premium)</span>
                <span className="summary-value" style={{ color: "#4ade80" }}>Included</span>
              </div>
              
              <div className="summary-line">
                <span className="summary-label">Taxes (18% GST)</span>
                <span className="summary-value">{formatCurrency(getPricing().tax)}</span>
              </div>

              <div className="total-price">
                <span>Total</span>
                <span>{formatCurrency(getPricing().total)}</span>
              </div>
            </div>

            <div className="guarantee-box">
              Your booking is protected by our secure guarantee. Free cancellation available up to 24 hours before pickup. All rates include comprehensive insurance coverage.
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
