import Hero from "../components/Hero";
import ImageMarquee from "../components/ImageMarquee";
import FeaturedCars from "../components/FeaturedCars";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
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
      <FeaturedCars />
      <WhyChooseUs />
      <Testimonials />
      
      {/* Newsletter Section */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-4xl mx-auto text-center space-y-12 bg-gradient-to-br from-blue-600/20 to-transparent p-16 rounded-[40px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              JOIN THE <span className="text-blue-500">INNER CIRCLE</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Subscribe to our newsletter for exclusive offers, new fleet arrivals, and luxury travel insights.
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}
