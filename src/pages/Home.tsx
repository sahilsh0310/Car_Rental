import Hero from "../components/Hero";
import ImageMarquee from "../components/ImageMarquee";
import FeaturedCars from "../components/FeaturedCars";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import CanvasScrollVideo from "../components/CanvasScrollVideo";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToMarquee = () => {
    marqueeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden"
    >
      <Hero onWatchShowreel={scrollToMarquee} />
      <div ref={marqueeRef}>
        <ImageMarquee />
      </div>
      <CanvasScrollVideo />
      <FeaturedCars />
      <WhyChooseUs />
      <Testimonials />
      
      {/* Newsletter Section */}
      <section style={{ padding: "6rem 1.5rem", background: "#030303" }}>
        <div style={{
          maxWidth: "860px", margin: "0 auto", textAlign: "center",
          padding: "4rem 3rem",
          background: "linear-gradient(135deg, rgba(0,242,255,0.04) 0%, transparent 60%)",
          border: "1px solid rgba(0,242,255,0.12)",
          borderRadius: "4px",
          position: "relative", overflow: "hidden"
        }}>
          {/* corner accent */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "60px", height: "2px", background: "linear-gradient(90deg, #00f2ff, transparent)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "2px", height: "60px", background: "linear-gradient(180deg, #00f2ff, transparent)" }} />

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00f2ff", marginBottom: "1.5rem", opacity: 0.7 }}>
            Inner Circle
          </p>
          <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f0f2f5", marginBottom: "1rem", lineHeight: 1 }}>
            STAY IN THE<br /><span style={{ color: "#00f2ff" }}>FAST LANE</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
            Exclusive fleet drops, priority booking windows, and luxury travel insights — delivered to your inbox.
          </p>
          <form
            style={{ display: "flex", flexDirection: "row", gap: "8px", maxWidth: "440px", margin: "0 auto" }}
            onSubmit={e => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                padding: "12px 16px", color: "#fff", outline: "none", borderRadius: "2px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
                letterSpacing: "0.05em", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,242,255,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              style={{
                background: "#00f2ff", border: "none", color: "#000",
                padding: "12px 24px", fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.12em", cursor: "pointer", borderRadius: "2px",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseOver={e => { (e.target as HTMLButtonElement).style.background = "#40f8ff"; (e.target as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,242,255,0.3)"; }}
              onMouseOut={e => { (e.target as HTMLButtonElement).style.background = "#00f2ff"; (e.target as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}
