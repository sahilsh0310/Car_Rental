import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Cars = lazy(() => import("./pages/Cars"));
const CarDetails = lazy(() => import("./pages/CarDetails"));
const Booking = lazy(() => import("./pages/Booking"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
          <Navbar />
          <main>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/:id" element={<CarDetails />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

