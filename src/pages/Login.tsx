import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const coreRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mouse tracking effect for diffusion core
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (coreRef.current) {
        const x = e.clientX - 300;
        const y = e.clientY - 300;
        coreRef.current.style.left = `${x}px`;
        coreRef.current.style.top = `${y}px`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg-deep: #080808;
          --phosphor-blue: #2e7eff;
          --phosphor-glow: rgba(46, 126, 255, 0.15);
          --phosphor-hot: #80b4ff;
          --surface-edge: #1a1a1a;
          --text-dim: #666;
        }
        
        * {
          cursor: crosshair;
        }
        
        input {
          cursor: text !important;
        }
        
        button, a {
          cursor: crosshair;
        }

        /* Dark Navbar */
        .login-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          padding: 20px 40px;
          background: linear-gradient(to bottom, rgba(8, 8, 8, 0.95), rgba(8, 8, 8, 0.5));
          backdrop-filter: blur(10px);
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(-20px);
        }

        @keyframes slideDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid var(--surface-edge);
          color: var(--phosphor-blue);
          padding: 10px 20px;
          border-radius: 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: crosshair;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .back-button:hover {
          border-color: var(--phosphor-blue);
          box-shadow: 0 0 15px var(--phosphor-glow);
          transform: translateX(-5px);
          background: rgba(46, 126, 255, 0.05);
        }

        .back-button:active {
          transform: translateX(-5px) scale(0.98);
        }

        .back-button svg {
          width: 16px;
          height: 16px;
        }

        .terminal-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(26, 26, 26, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26, 26, 26, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .login-container {
          position: fixed;
          inset: 0;
          background-color: var(--bg-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: fadeIn 0.8s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 999;
          opacity: 0.04;
        }

        .diffusion-core {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--phosphor-glow) 0%, transparent 70%);
          filter: blur(80px);
          animation: pulse 8s infinite alternate ease-in-out;
          z-index: 1;
          pointer-events: none;
          transition: left 2s cubic-bezier(0.16, 1, 0.3, 1), top 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pulse {
          0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          100% { transform: scale(1.2) translate(20px, -20px); opacity: 0.8; }
        }

        .login-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 40px;
        }

        .login-header {
          margin-bottom: 80px;
          opacity: 0;
          transform: translateY(20px);
          animation: reveal 1s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-h1 {
          font-size: 3.5rem;
          letter-spacing: -0.05em;
          line-height: 0.9;
          color: var(--phosphor-hot);
          text-shadow: 0 0 20px var(--phosphor-glow);
          margin-bottom: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 900;
        }

        .login-subtitle {
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          color: var(--text-dim);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 40px;
          opacity: 0;
          animation: reveal 1s 0.2s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-group {
          position: relative;
          border-bottom: 1px solid var(--surface-edge);
          transition: border-color 0.4s ease;
        }

        .input-group:focus-within {
          border-color: var(--phosphor-blue);
        }

        .input-group label {
          position: absolute;
          top: -20px;
          left: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .input-group input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 12px 0;
          color: var(--phosphor-hot);
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          outline: none;
        }

        .input-group input::placeholder {
          color: rgba(46, 126, 255, 0.3);
        }

        .input-glow {
          position: absolute;
          bottom: -1px;
          left: 0;
          height: 1px;
          width: 0;
          background: var(--phosphor-blue);
          box-shadow: 0 0 15px var(--phosphor-blue);
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-group input:focus + .input-glow {
          width: 100%;
        }

        .error-message {
          color: #ff6b6b;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          margin-bottom: 20px;
          text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }

        .action-area {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .login-button {
          background: var(--phosphor-blue);
          color: var(--bg-deep);
          border: none;
          padding: 14px 32px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          position: relative;
          overflow: hidden;
          cursor: crosshair;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-transform: uppercase;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px var(--phosphor-glow);
          background: var(--phosphor-hot);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .forgot-pass {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-dim);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.3s ease;
          cursor: crosshair;
        }

        .forgot-pass:hover {
          color: var(--phosphor-blue);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 20px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--surface-edge);
        }

        .divider-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .google-button {
          width: 100%;
          background: #fff;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          color: #1f1f1f;
          cursor: crosshair;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-radius: 4px;
        }

        .google-button:hover:not(:disabled) {
          background: #f5f5f5;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }

        .google-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
        }

        .google-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="login-container">
        <div className="terminal-grid"></div>
        <div className="grain-overlay"></div>
        <div className="diffusion-core" ref={coreRef}></div>

        {/* Dark Navbar */}
        <nav className="login-navbar">
          <button 
            className="back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft />
            Back to Home
          </button>
        </nav>

        <main className="login-main">
          <header className="login-header">
            <div className="login-subtitle">Secure Diffusion Layer</div>
            <h1 className="login-h1">DRIVE<span style={{ color: "var(--phosphor-blue)" }}>X</span></h1>
          </header>

          <form className="login-form" onSubmit={handleEmailLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <div className="input-glow"></div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="input-glow"></div>
            </div>

            <div className="action-area">
              <a href="#" className="forgot-pass">
                Recover_Access
              </a>
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "INITIALIZING..." : "INITIALIZE"}
              </button>
            </div>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">Or</span>
            <div className="divider-line"></div>
          </div>

          <button
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2" fill="none"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                  </path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </main>
      </div>
    </>
  );
}
