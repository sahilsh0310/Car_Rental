import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import { motion } from "motion/react";
import { Star, Fuel, Gauge, Users, Shield, Zap, Clock, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

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

  if (loading) return <div className="h-screen bg-[#0a0a0a]"></div>;
  if (!car) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Car not found</div>;

  const allImages = car.images && car.images.length > 0 ? car.images : [car.image];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div
              layoutId={`car-image-${car.id}`}
              className="relative h-[500px] rounded-[40px] overflow-hidden border border-white/10"
            >
              <img
                src={allImages[activeImage]}
                alt={car.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-white">{car.rating}</span>
              </div>
            </motion.div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === i ? "border-blue-500 scale-95" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                  {car.type}
                </span>
                <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">{car.brand}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
                {car.name}
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                {car.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Gauge, label: "Transmission", value: car.specs.transmission },
                { icon: Fuel, label: "Fuel Type", value: car.specs.fuelType },
                { icon: Users, label: "Seats", value: car.specs.seats },
                { icon: Zap, label: "Engine", value: car.specs.engine },
              ].map((spec, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-2">
                  <spec.icon className="w-5 h-5 text-blue-500" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{spec.label}</p>
                  <p className="text-sm font-bold text-white">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-blue-500/20">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Price Per Day</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{formatCurrency(car.pricePerDay)}</span>
                  <span className="text-blue-100 text-sm font-medium">/ day</span>
                </div>
              </div>
              <Link
                to={`/booking/${car.id}`}
                className="w-full md:w-auto px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                BOOK THIS CAR
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              {[
                { icon: Shield, title: "Secure", desc: "Full Insurance" },
                { icon: Clock, title: "24/7", desc: "Concierge" },
                { icon: Zap, title: "Fast", desc: "Instant Booking" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <item.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold">{item.title}</h4>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
