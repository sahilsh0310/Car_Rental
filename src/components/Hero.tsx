import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  onWatchShowreel?: () => void;
}

export default function Hero({ onWatchShowreel }: HeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Car"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050507]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          {/* Badge */}
          <span style={{
            display: "inline-block",
            padding: "6px 18px",
            background: "rgba(0,242,255,0.06)",
            border: "1px solid rgba(0,242,255,0.2)",
            borderRadius: "100px",
            color: "#00f2ff",
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}>
            The Ultimate Driving Experience
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
            DRIVE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#a0f8ff]">
              DREAM CAR
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Experience luxury, speed, and comfort with our exclusive fleet of high-performance vehicles. Your journey begins here.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary — Explore Fleet */}
          <Link
            to="/cars"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(0,242,255,0.4)",
              color: "#00f2ff",
              padding: "14px 28px",
              borderRadius: "100px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none",
              backdropFilter: "blur(12px)",
              transition: "all 0.25s ease",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,242,255,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 28px rgba(0,242,255,0.25)";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            Explore Fleet <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary — Watch Showreel */}
          <button
            onClick={onWatchShowreel}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              padding: "14px 28px",
              borderRadius: "100px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              transition: "all 0.25s ease",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Play className="w-3 h-3 fill-white text-white" style={{ marginLeft: 2 }} />
            </div>
            Watch Showreel
          </button>
        </motion.div>
      </div>
    </section>
  );
}
