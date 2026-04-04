import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  onWatchShowreel?: () => void;
}

export default function Hero({ onWatchShowreel }: HeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Car"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
            The Ultimate Driving Experience
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
            DRIVE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">
              DREAM CAR
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Experience luxury, speed, and comfort with our exclusive fleet of high-performance vehicles. Your journey begins here.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/cars"
            className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            Explore Fleet
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={onWatchShowreel}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold flex items-center gap-2 transition-all backdrop-blur-md"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-black fill-black ml-0.5" />
            </div>
            Watch Showreel
          </button>
        </motion.div>
      </div>
    </section>
  );
}
