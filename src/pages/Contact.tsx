import { motion } from "motion/react";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from "lucide-react";

export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Get In Touch</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
            CONTACT <span className="text-gray-600">US</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Have questions about our fleet or services? Our dedicated concierge team is ready to assist you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {[
              { icon: Phone, title: "Call Us", value: "+1 (555) 000-0000", desc: "Available 24/7 for support" },
              { icon: Mail, title: "Email Us", value: "concierge@drivex.com", desc: "Response within 2 hours" },
              { icon: MapPin, title: "Visit Us", value: "Beverly Hills, CA", desc: "123 Luxury Drive, 90210" },
              { icon: Clock, title: "Business Hours", value: "Mon - Sun", desc: "Open 24 Hours" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all">
                  <item.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold">{item.title}</h4>
                  <p className="text-blue-500 font-bold">{item.value}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-12 rounded-[40px] backdrop-blur-xl">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subject</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option>General Inquiry</option>
                  <option>Booking Support</option>
                  <option>Fleet Partnership</option>
                  <option>Media & Press</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <textarea
                  rows={6}
                  placeholder="How can we help you?"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20">
                  SEND MESSAGE <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
