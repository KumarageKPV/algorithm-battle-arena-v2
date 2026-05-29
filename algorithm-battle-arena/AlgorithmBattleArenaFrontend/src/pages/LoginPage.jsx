import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../services/auth"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  // original states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  // UI-only state to disable form during login and show loader
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // keep your logic and console logs unchanged — only add the loading toggles
  async function onSubmit(e) {
    e.preventDefault()
    setStatus("Logging in...")
    setIsLoading(true)

          try {
            const { role } = await login(email, password)
            console.log(role)
            setStatus("Login successful!")
            setIsLoading(false)
            
            // Role-based navigation
            switch (role) {
              case 'Admin':
                navigate("/admin")
                break
              case 'Teacher':
                navigate("/teacher")
                break
              case 'Student':
                navigate("/student-dashboard")
                break
              default:
                navigate("/dashboard")
            }
          } catch (err) {      console.error("Login error:", err)
      const backendMsg = err.response?.data ?? err.message
      setStatus("Login failed: " + JSON.stringify(backendMsg))
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
      <style>{`
.aba-nav-btn,
.aba-nav-btn:focus,
.aba-nav-btn:hover,
.aba-nav-btn:active,
.aba-nav-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}
.aba-nav-btn::-moz-focus-inner { border: 0 !important; }
.aba-nav-btn:-moz-focusring { outline: none !important; }
.aba-nav-btn { -webkit-tap-highlight-color: transparent; }
.aba-focus:focus-visible { outline: 3px solid #ff6b00 !important; box-shadow: 0 0 20px rgba(255,107,0,0.5) !important; }
      `}</style>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/images/LandingPage.jpg"
          alt="Arena Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)',
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className="select-none mb-4"
            style={{
              fontSize: 'clamp(4rem, 16vw, 6rem)',
              fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontWeight: '900',
              color: '#ffed4e',
              textShadow:
                '6px 6px 0px #ff6b00, 12px 12px 0px #000, 0 0 40px rgba(255, 237, 78, 0.5)',
              letterSpacing: '0.08em',
              lineHeight: '1',
              WebkitTextStroke: '3px #ff6b00',
              paintOrder: 'stroke fill',
            }}
          >
            ENTER ARENA
          </h1>
          <p
            className="select-none"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
              color: '#ff3366',
              letterSpacing: '0.15em',
              textShadow: '0 0 20px rgba(255, 51, 102, 0.8), 2px 2px 0px #000',
            }}
          >
            AUTHENTICATE WARRIOR
          </p>
        </div>

        {/* Login Form Card */}
        <div
          style={{
            background: 'rgba(20, 20, 20, 0.85)',
            border: '6px solid #ff6b00',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(255, 107, 0, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)',
          }}
          className="p-10 sm:p-14"
        >
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label
                className="block mb-3 select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.7rem',
                  color: '#ffed4e',
                  letterSpacing: '0.1em',
                  textShadow: '2px 2px 0px #000',
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="warrior@arena.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.8rem',
                  background: isLoading ? 'rgba(50, 50, 50, 0.5)' : 'rgba(30, 30, 30, 0.8)',
                  border: '4px solid #666',
                  color: '#fff',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                className={`w-full px-6 py-5 focus:outline-none focus:border-[#ff6b00] focus:shadow-[0_0_20px_rgba(255,107,0,0.5)] ${
                  isLoading ? "cursor-not-allowed opacity-60" : ""
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block mb-3 select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.7rem',
                  color: '#ffed4e',
                  letterSpacing: '0.1em',
                  textShadow: '2px 2px 0px #000',
                }}
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.8rem',
                    background: isLoading ? 'rgba(50, 50, 50, 0.5)' : 'rgba(30, 30, 30, 0.8)',
                    border: '4px solid #666',
                    color: '#fff',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
                  className={`w-full px-6 py-5 pr-24 focus:outline-none focus:border-[#ff6b00] focus:shadow-[0_0_20px_rgba(255,107,0,0.5)] ${
                    isLoading ? "cursor-not-allowed opacity-60" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                  className={`aba-nav-btn aba-focus absolute right-6 top-1/2 -translate-y-1/2 p-2 text-[#ffed4e] hover:text-[#ff6b00] transition-colors ${
                    isLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {showPassword ? <EyeOff className="w-10 h-10" /> : <Eye className="w-10 h-10" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="aba-nav-btn aba-focus w-full relative group"
                style={{
                  background: isLoading ? '#444' : '#6B0F1A',
                  border: isLoading ? '6px solid #222' : '6px solid #4a0a0e',
                  padding: '28px 80px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '12px',
                  boxShadow: isLoading 
                    ? '0 8px 0 #222' 
                    : '0 12px 0 #4a0a0e, 0 0 30px rgba(107, 15, 26, 0.5)',
                  transform: 'translateY(0)',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#8B1538';
                    e.currentTarget.style.transform = 'translateY(6px)';
                    e.currentTarget.style.boxShadow = '0 6px 0 #4a0a0e, 0 0 40px rgba(139, 21, 56, 0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#6B0F1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 0 #4a0a0e, 0 0 30px rgba(107, 15, 26, 0.5)';
                  }
                }}
              >
                <span
                  className="select-none"
                  style={{
                    fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                    fontSize: 'clamp(2.2rem, 6vw, 2.8rem)',
                    fontWeight: '900',
                    color: isLoading ? '#888' : '#fff',
                    letterSpacing: '0.12em',
                    textShadow: isLoading ? 'none' : '4px 4px 8px rgba(0,0,0,0.8)',
                  }}
                >
                  {isLoading ? "ACCESSING..." : "LOGIN"}
                </span>
              </button>
            </div>

            {/* Status Message */}
            {!isLoading && status && (
              <p
                className="text-center"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.5rem',
                  color: status.includes('failed') ? '#ff3366' : '#4ade80',
                  letterSpacing: '0.05em',
                  textShadow: '2px 2px 0px #000',
                }}
                aria-live="polite"
              >
                {status}
              </p>
            )}

            {/* Footer link */}
            <div className="text-center pt-8 border-t-2 border-gray-700">
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.6rem',
                  color: '#ccc',
                }}
              >
                NO ACCOUNT?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  disabled={isLoading}
                  style={{
                    background: 'transparent',
                    border: '0',
                    borderBottom: '3px solid transparent',
                    padding: '4px 0',
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 'bold',
                    color: '#ffed4e',
                    textShadow: '0 0 10px rgba(255, 237, 78, 0.5)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className={`aba-nav-btn aba-focus ${
                    isLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.color = '#ff3366';
                      e.currentTarget.style.borderBottom = '3px solid #ff3366';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.color = '#ffed4e';
                      e.currentTarget.style.borderBottom = '3px solid transparent';
                    }
                  }}
                >
                  REGISTER HERE
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
