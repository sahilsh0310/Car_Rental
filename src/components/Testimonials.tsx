import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "James Wilson",
    role: "CEO, TechVision",
    content: "The Model S Plaid was in pristine condition. The delivery was on time and the service was impeccable. Truly a premium experience.",
    avatar: "https://i.pravatar.cc/150?u=james",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Fashion Designer",
    content: "Renting the Porsche 911 for my weekend trip was the best decision. DriveX makes luxury accessible and effortless.",
    avatar: "https://i.pravatar.cc/150?u=elena",
    rating: 5
  },
  {
    name: "Marcus Chen",
    role: "Professional Athlete",
    content: "I've used many rental services, but DriveX is on another level. Their fleet is unmatched and the attention to detail is superb.",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-32 px-6 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Testimonials</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            WHAT OUR <span className="text-gray-600">CLIENTS SAY</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl relative group hover:border-blue-500/30 transition-all"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 italic">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
