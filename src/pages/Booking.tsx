import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Car, Booking as BookingType } from "../types";
import { motion } from "motion/react";
import { Calendar, MapPin, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { differenceInDays, parseISO } from "date-fns";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [formData, setFormData] = useState({
    pickupDate: "",
    dropoffDate: "",
    pickupLocation: "Los Angeles International Airport (LAX)",
  });

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

  const calculateTotal = () => {
    if (!car || !formData.pickupDate || !formData.dropoffDate) return 0;
    const days = Math.max(1, differenceInDays(parseISO(formData.dropoffDate), parseISO(formData.pickupDate)));
    return days * car.pricePerDay;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car) return;

    setBookingStatus("submitting");
    try {
      const bookingData: Omit<BookingType, "id"> = {
        userId: user.uid,
        carId: car.id,
        pickupDate: formData.pickupDate,
        dropoffDate: formData.dropoffDate,
        pickupLocation: formData.pickupLocation,
        totalPrice: calculateTotal(),
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

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

  if (loading) return <div className="h-screen bg-[#0a0a0a]"></div>;
  if (!car) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Car not found</div>;

  if (bookingStatus === "success") {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[40px] text-center space-y-6 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">BOOKING CONFIRMED!</h2>
          <p className="text-gray-400">
            Your luxury ride is ready. We've sent the details to your email. Redirecting you home...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              RESERVE YOUR <span className="text-blue-500">EXPERIENCE</span>
            </h1>
            <p className="text-gray-400">Complete the details below to finalize your luxury car rental.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Pickup Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Drop-off Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.dropoffDate}
                  onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Pickup Location
              </label>
              <select
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="LAX">Los Angeles International Airport (LAX)</option>
                <option value="SFO">San Francisco International Airport (SFO)</option>
                <option value="JFK">John F. Kennedy International Airport (JFK)</option>
                <option value="MIA">Miami International Airport (MIA)</option>
              </select>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["Credit Card", "Apple Pay", "Crypto"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    className="p-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:border-blue-500 transition-all"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={bookingStatus === "submitting" || !user}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-black rounded-3xl text-xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20"
            >
              {bookingStatus === "submitting" ? (
                "Processing..."
              ) : user ? (
                <>
                  CONFIRM BOOKING <ArrowRight className="w-6 h-6" />
                </>
              ) : (
                "PLEASE SIGN IN TO BOOK"
              )}
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] sticky top-32 space-y-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white">Booking Summary</h3>
            
            <div className="flex gap-4 items-center">
              <img src={car.image} alt="" className="w-24 h-24 rounded-2xl object-cover border border-white/10" />
              <div>
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">{car.brand}</p>
                <h4 className="text-white font-bold">{car.name}</h4>
                <p className="text-gray-500 text-xs">{car.type}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daily Rate</span>
                <span className="text-white font-bold">{formatCurrency(car.pricePerDay)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rental Duration</span>
                <span className="text-white font-bold">
                  {formData.pickupDate && formData.dropoffDate 
                    ? `${Math.max(1, differenceInDays(parseISO(formData.dropoffDate), parseISO(formData.pickupDate)))} Days`
                    : "0 Days"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Insurance (Premium)</span>
                <span className="text-green-500 font-bold">Included</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                <span className="text-white font-bold">Total Price</span>
                <span className="text-3xl font-black text-blue-500">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-200 leading-relaxed">
                Your booking is protected by our DriveX Guarantee. Free cancellation up to 24 hours before pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
