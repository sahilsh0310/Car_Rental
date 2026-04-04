import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Fuel, Gauge, Users, ArrowRight } from "lucide-react";
import { Car } from "../types";
import { cn, formatCurrency } from "../lib/utils";

interface CarCardProps {
  car: Car;
  className?: string;
}

export default function CarCard({ car, className }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={cn(
        "group bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10",
        className
      )}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white">{car.rating}</span>
        </div>
        {car.isFeatured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
            Featured
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-blue-500 uppercase tracking-widest mb-1">
              {car.brand}
            </p>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {car.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{formatCurrency(car.pricePerDay)}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Per Day</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
          <div className="flex flex-col items-center gap-1">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] text-gray-400 font-medium">{car.specs.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] text-gray-400 font-medium">{car.specs.fuelType}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] text-gray-400 font-medium">{car.specs.seats} Seats</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            to={`/cars/${car.id}`}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-center transition-all"
          >
            Details
          </Link>
          <Link
            to={`/booking/${car.id}`}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Book Now
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
