import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Car } from "../types";
import CarCard from "../components/CarCard";
import AIRecommendation from "../components/AIRecommendation";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../lib/utils";

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(1000);

  const carTypes = ["All", "Sedan", "SUV", "Sports", "Luxury", "Convertible"];

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(collection(db, "cars"), orderBy("pricePerDay", "asc"));
        const snapshot = await getDocs(q);
        const carData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Car));
        setCars(carData);
        setFilteredCars(carData);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let result = cars;
    if (searchTerm) {
      result = result.filter((car) => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType !== "All") {
      result = result.filter((car) => car.type === selectedType);
    }
    result = result.filter((car) => car.pricePerDay <= priceRange);
    setFilteredCars(result);
  }, [searchTerm, selectedType, priceRange, cars]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 min-h-screen bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            OUR <span className="text-gray-600">FLEET</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Choose from our curated selection of world-class vehicles. Each one is a masterpiece of engineering and luxury.
          </p>
        </div>

        {/* AI Recommendation Section */}
        {!loading && cars.length > 0 && (
          <AIRecommendation allCars={cars} />
        )}

        <div className="space-y-12">
          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {carTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                      selectedType === type
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 w-full lg:w-auto">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <div className="flex-1 lg:w-48">
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  Max: ${priceRange}
                </span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[500px] bg-white/5 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-white">{filteredCars.length}</span> vehicles
                </p>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredCars.length > 0 ? (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {filteredCars.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <X className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">No vehicles found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search term.</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedType("All");
                        setPriceRange(1000);
                      }}
                      className="text-blue-500 font-bold hover:underline"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
