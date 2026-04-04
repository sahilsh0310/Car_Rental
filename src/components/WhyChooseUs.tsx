import { Shield, Zap, Clock, CreditCard } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Shield,
    title: "Premium Insurance",
    description: "Fully comprehensive insurance coverage for every rental, giving you total peace of mind on the road."
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Our seamless digital platform allows you to book your dream car in less than 60 seconds."
  },
  {
    icon: Clock,
    title: "24/7 Concierge",
    description: "Dedicated support team available around the clock to assist with any requests during your journey."
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description: "No hidden fees. What you see is what you pay, with flexible payment options including crypto."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-32 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Why DriveX</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
              REDEFINING THE <br />
              <span className="text-gray-600">RENTAL EXPERIENCE</span>
            </h2>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            We don't just rent cars; we provide access to a lifestyle. Every vehicle in our fleet is meticulously maintained and detailed to perfection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            {features.map((feature, i) => (
              <div key={i} className="space-y-3">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <feature.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="text-white font-bold">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full"></div>
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000"
            alt="Luxury Interior"
            referrerPolicy="no-referrer"
            className="relative rounded-3xl border border-white/10 shadow-2xl"
          />
          <div className="absolute -bottom-10 -left-10 bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hidden md:block">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-blue-500">10k+</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Happy <br /> Customers
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
