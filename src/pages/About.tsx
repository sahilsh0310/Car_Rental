import { motion } from "motion/react";
import { Shield, Zap, Clock, Globe, Award, Users } from "lucide-react";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Our Story</span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
                DRIVEN BY <br />
                <span className="text-gray-600">EXCELLENCE</span>
              </h1>
            </div>
            <p className="text-gray-400 text-xl leading-relaxed">
              Founded in 2020, DriveX was born from a simple vision: to make the world's most extraordinary vehicles accessible to those who appreciate the art of driving.
            </p>
            <div className="flex gap-12 pt-4">
              <div>
                <div className="text-4xl font-black text-white">50+</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Luxury Cars</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white">12</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Global Cities</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white">10k+</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Happy Clients</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full"></div>
            <img
              src="https://images.unsplash.com/photo-1562141989-c5c79ac8f576?auto=format&fit=crop&q=80&w=1000"
              alt="Luxury Showroom"
              referrerPolicy="no-referrer"
              className="relative rounded-[40px] border border-white/10 shadow-2xl"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Uncompromising Safety", desc: "Every vehicle undergoes a rigorous 150-point inspection before every rental." },
            { icon: Award, title: "Premium Quality", desc: "We only source the highest specification models from the world's leading manufacturers." },
            { icon: Globe, title: "Global Presence", desc: "Available in major luxury hubs worldwide, from Beverly Hills to Dubai." },
          ].map((value, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-12 rounded-[40px] space-y-6 hover:border-blue-500/30 transition-all">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <value.icon className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">{value.title}</h3>
              <p className="text-gray-400 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-20 rounded-[60px] border border-white/5 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            OUR MISSION IS TO <br />
            <span className="text-blue-500">INSPIRE EVERY JOURNEY</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            We believe that the journey is just as important as the destination. Our goal is to provide the perfect vehicle for every story, whether it's a coastal drive or a city escape.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
