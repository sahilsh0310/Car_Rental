import { Link } from "react-router-dom";
import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              DRIVE<span className="text-blue-500">X</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Experience the ultimate in luxury and performance. DriveX provides the world's most exclusive vehicle rentals with seamless service.
          </p>
          <div className="flex gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4">
            {["Home", "Fleet", "About Us", "Contact", "Booking"].map((link) => (
              <li key={link}>
                <Link
                  to={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-400 text-sm hover:text-blue-500 transition-colors"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Vehicle Types</h4>
          <ul className="space-y-4">
            {["Luxury Sedans", "Sport Cars", "Premium SUVs", "Electric Vehicles", "Convertibles"].map((type) => (
              <li key={type}>
                <Link
                  to="/cars"
                  className="text-gray-400 text-sm hover:text-blue-500 transition-colors"
                >
                  {type}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Info</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-gray-400">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <span>123 Luxury Drive, Beverly Hills, CA 90210</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-400">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" />
              <span>+1 (555) 000-0000</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-400">
              <Mail className="w-5 h-5 text-blue-500 shrink-0" />
              <span>contact@drivex.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© 2026 DriveX Premium Rentals. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
