"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { Eye, EyeOff, GraduationCap, Users, CheckCircle } from "lucide-react"

/** Password strength helper - unchanged logic */
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pw) => {
    let score = 0
    if (!pw) return 0
    if (pw.length >= 8) score++
    if (/[a-z]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++
    return score
  }

  const strength = getStrength(password)
  const getColor = () => {
    if (strength <= 2) return "#ff3366"
    if (strength <= 3) return "#ff6b00"
    return "#4ade80"
  }
  const getLabel = () => {
    if (strength <= 2) return "WEAK"
    if (strength <= 3) return "MEDIUM"
    return "STRONG"
  }

  if (!password) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '1.4rem',
            color: '#ccc',
            letterSpacing: '0.05em',
          }}
        >
          STRENGTH
        </span>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '1.4rem',
            color: getColor(),
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            textShadow: `0 0 10px ${getColor()}`,
          }}
        >
          {getLabel()}
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(50, 50, 50, 0.8)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(strength / 5) * 100}%`,
            background: getColor(),
            transition: 'all 0.3s ease',
            boxShadow: `0 0 16px ${getColor()}`,
          }}
        />
      </div>
    </div>
  )
}

/** Main RegisterPage component */
export default function RegisterPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("Student")
  const [formData, setFormData] = useState({
    role: "Student",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const validatePassword = (value) => {
    if (value.length < 8) return "At least 8 characters required"
    if (!/[a-z]/.test(value)) return "Must include a lowercase letter"
    if (!/[A-Z]/.test(value)) return "Must include an uppercase letter"
    if (!/\d/.test(value)) return "Must include a number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Must include a special character"
    return ""
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setFormData((prev) => ({ ...prev, role }))
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setStatusMessage("")
    if (!validateForm()) return

    setIsLoading(true)
    setStatusMessage("Registering...")

    const dto = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
    }

    try {
      if (selectedRole === "Student") {
        await api.auth.registerStudent(dto)
      } else {
        await api.auth.registerTeacher(dto)
      }

      setStatusMessage("Registered successfully! Redirecting...")
      setSuccess(true)
      // keep loading state off for clarity in modal
      setIsLoading(false)
    } catch (err) {
      const backendMsg = err?.response?.data || err?.message || err
      setStatusMessage("Registration failed: " + JSON.stringify(backendMsg))
      console.error("Registration error:", err)
      setIsLoading(false)
    }
  }

  // When success appears, auto-redirect after a short delay (same UX as your original)
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => {
      navigate("/login")
    }, 2500)
    return () => clearTimeout(t)
  }, [success, navigate])

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center py-8">
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
      <div className="relative z-10 w-full max-w-5xl px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className="select-none mb-4"
            style={{
              fontSize: 'clamp(3.6rem, 14vw, 5rem)',
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
            JOIN ARENA
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
            CREATE WARRIOR PROFILE
          </p>
        </div>

        {/* Registration Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(20, 20, 20, 0.85)',
            border: '6px solid #ff6b00',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(255, 107, 0, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)',
          }}
          className="p-10 sm:p-14 space-y-8"
        >
          {/* Role Selection */}
          <div className="space-y-4">
            <label
              className="block select-none"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1.7rem',
                color: '#ffed4e',
                letterSpacing: '0.1em',
                textShadow: '2px 2px 0px #000',
              }}
            >
              SELECT ROLE
            </label>

            <div className="grid grid-cols-2 gap-4">
              {[
                { role: "Student", icon: GraduationCap },
                { role: "Teacher", icon: Users },
              ].map(({ role, icon }) => {
                const isSelected = selectedRole === role;
                const isTeacher = role === "Teacher";
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    style={{
                      background: isSelected 
                        ? (isTeacher ? '#ffed4e' : 'rgba(107, 15, 26, 0.9)') 
                        : 'rgba(40, 40, 40, 0.8)',
                      border: isSelected 
                        ? (isTeacher ? '6px solid #ff6b00' : '6px solid #ff6b00') 
                        : '6px solid #666',
                      borderRadius: '12px',
                      padding: '32px',
                      cursor: 'pointer',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      boxShadow: isSelected 
                        ? (isTeacher ? '0 0 30px rgba(255, 237, 78, 0.5)' : '0 0 30px rgba(255, 107, 0, 0.5)') 
                        : 'none',
                    }}
                    className="aba-nav-btn aba-focus relative flex flex-col items-center gap-4"
                  >
                    {React.createElement(icon, {
                      className: 'w-12 h-12',
                      style: {
                        color: isSelected ? (isTeacher ? '#ff0000' : '#ffed4e') : '#ccc'
                      }
                    })}
                    <span
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '1.7rem',
                        fontWeight: 'bold',
                        color: isSelected 
                          ? (isTeacher ? '#ff0000' : '#ffed4e') 
                          : '#ccc',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {role.toUpperCase()}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute -top-4 -right-4 w-8 h-8 rounded-full"
                        style={{
                          background: '#4ade80',
                          border: '4px solid #000',
                          boxShadow: '0 0 16px #4ade80',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "FIRST NAME", name: "firstName", placeholder: "Enter first name" },
              { label: "LAST NAME", name: "lastName", placeholder: "Enter last name" },
            ].map((field) => (
              <div key={field.name} className="space-y-3">
                <label
                  className="block select-none"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.5rem',
                    color: '#ffed4e',
                    letterSpacing: '0.1em',
                    textShadow: '2px 2px 0px #000',
                  }}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  disabled={isLoading}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.7rem',
                    background: isLoading ? 'rgba(50, 50, 50, 0.5)' : errors[field.name] ? 'rgba(60, 20, 20, 0.8)' : 'rgba(30, 30, 30, 0.8)',
                    border: errors[field.name] ? '4px solid #ff3366' : '4px solid #666',
                    color: '#fff',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
                  className={`w-full px-6 py-5 focus:outline-none focus:border-[#ff6b00] focus:shadow-[0_0_20px_rgba(255,107,0,0.5)] ${
                    isLoading ? "cursor-not-allowed opacity-60" : ""
                  }`}
                />
                {errors[field.name] && (
                  <p
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.4rem',
                      color: '#ff3366',
                      textShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
                    }}
                  >
                    ! {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="space-y-4">
            <label
              className="block select-none"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1.5rem',
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1.7rem',
                background: isLoading ? 'rgba(50, 50, 50, 0.5)' : errors.email ? 'rgba(60, 20, 20, 0.8)' : 'rgba(30, 30, 30, 0.8)',
                border: errors.email ? '4px solid #ff3366' : '4px solid #666',
                color: '#fff',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
              className={`w-full px-6 py-5 focus:outline-none focus:border-[#ff6b00] focus:shadow-[0_0_20px_rgba(255,107,0,0.5)] ${
                isLoading ? "cursor-not-allowed opacity-60" : ""
              }`}
            />
            {errors.email && (
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.4rem',
                  color: '#ff3366',
                  textShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
                }}
              >
                ! {errors.email}
              </p>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label
                className="block select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.5rem',
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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.7rem',
                    background: isLoading ? 'rgba(50, 50, 50, 0.5)' : errors.password ? 'rgba(60, 20, 20, 0.8)' : 'rgba(30, 30, 30, 0.8)',
                    border: errors.password ? '4px solid #ff3366' : '4px solid #666',
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
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                  className={`aba-nav-btn aba-focus absolute right-6 top-1/2 -translate-y-1/2 p-2 text-[#ffed4e] hover:text-[#ff6b00] transition-colors ${
                    isLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {showPassword ? <EyeOff className="w-10 h-10" /> : <Eye className="w-10 h-10" />}
                </button>
              </div>

              <PasswordStrengthIndicator password={formData.password} />

              {errors.password && (
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.4rem',
                    color: '#ff3366',
                    textShadow: '0 0 5px rgba(255, 51, 102, 0.5)',
                  }}
                >
                  ! {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label
                className="block select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.5rem',
                  color: '#ffed4e',
                  letterSpacing: '0.1em',
                  textShadow: '2px 2px 0px #000',
                }}
              >
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.passwordConfirm}
                  onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
                  disabled={isLoading}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.7rem',
                    background: isLoading ? 'rgba(50, 50, 50, 0.5)' : errors.passwordConfirm ? 'rgba(60, 20, 20, 0.8)' : 'rgba(30, 30, 30, 0.8)',
                    border: errors.passwordConfirm ? '4px solid #ff3366' : '4px solid #666',
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                  className={`aba-nav-btn aba-focus absolute right-6 top-1/2 -translate-y-1/2 p-2 text-[#ffed4e] hover:text-[#ff6b00] transition-colors ${
                    isLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {showConfirmPassword ? <EyeOff className="w-10 h-10" /> : <Eye className="w-10 h-10" />}
                </button>
              </div>

              {errors.passwordConfirm && (
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.4rem',
                    color: '#ff3366',
                    textShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
                  }}
                >
                  ! {errors.passwordConfirm}
                </p>
              )}
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
                {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
              </span>
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && !success && (
            <p
              className="text-center"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1.5rem',
                color: statusMessage.includes('failed') ? '#ff3366' : '#4ade80',
                letterSpacing: '0.05em',
                textShadow: '2px 2px 0px #000',
              }}
              aria-live="polite"
            >
              {statusMessage}
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
              ALREADY REGISTERED?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
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
                LOGIN HERE
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Success modal overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal card */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              border: '6px solid #4ade80',
              borderRadius: '16px',
              boxShadow: '0 0 60px rgba(74, 222, 128, 0.5)',
            }}
            className="relative z-10 w-full max-w-md mx-4 p-16 flex flex-col items-center gap-8"
          >
            <div
              style={{
                width: '160px',
                height: '160px',
                background: '#4ade80',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(74, 222, 128, 0.8)',
              }}
            >
              <CheckCircle className="w-20 h-20 text-black" />
            </div>

            <h2
              style={{
                fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: '3rem',
                color: '#4ade80',
                letterSpacing: '0.1em',
                textShadow: '0 0 20px rgba(74, 222, 128, 0.8), 4px 4px 0px #000',
              }}
            >
              SUCCESS!
            </h2>
            <p
              className="text-center"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1.8rem',
                color: '#ccc',
                letterSpacing: '0.05em',
              }}
            >
              Account created! Redirecting to login...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
