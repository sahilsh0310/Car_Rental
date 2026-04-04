import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import CarCard from "./CarCard";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return null;

  return (
    <section className="py-32 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Our Collection</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              FEATURED <br /> <span className="text-gray-600">FLEET</span>
            </h2>
          </div>
          <Link
            to="/cars"
            className="group flex items-center gap-2 text-white font-bold hover:text-blue-500 transition-colors"
          >
            View All Vehicles
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
