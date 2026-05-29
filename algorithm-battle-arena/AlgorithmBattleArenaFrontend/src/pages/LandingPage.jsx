import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/images/LandingPage.jpg"
          alt="Arena Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
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
      <div className="relative z-10 flex flex-col items-center gap-16 px-4">
        {/* Title */}
        <div className="flex flex-col items-center">
          <h1
            className="text-center tracking-wider select-none"
            style={{
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
              fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontWeight: '900',
              color: '#ffed4e',
              textShadow:
                '4px 4px 0px #ff6b00, 8px 8px 0px #000, 0 0 30px rgba(255, 237, 78, 0.6), 0 0 50px rgba(255, 107, 0, 0.4)',
              letterSpacing: '0.08em',
              lineHeight: '0.95',
              WebkitTextStroke: '2px #ff6b00',
              paintOrder: 'stroke fill',
            }}
          >
            ALGORITHM
            <br />
            BATTLE ARENA
          </h1>
        </div>

        {/* Start Button */}
        <button
          onClick={() => navigate('/login')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group"
          style={{
            background: isHovered ? '#8B1538' : '#6B0F1A',
            border: '4px solid #4a0a0e',
            padding: '20px 60px',
            cursor: 'pointer',
            borderRadius: '50px',
            boxShadow: isHovered
              ? '0 0 30px rgba(139, 21, 56, 0.8), inset 0 2px 0 rgba(255,255,255,0.3)'
              : '0 8px 0 #4a0a0e, 0 0 20px rgba(107, 15, 26, 0.6)',
            transform: isHovered ? 'translateY(4px)' : 'translateY(0)',
            transition: 'all 0.1s ease',
          }}
        >
          <span
            className="select-none"
            style={{
              fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '900',
              color: '#fff',
              letterSpacing: '0.15em',
              textShadow: isHovered
                ? '0 0 10px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.8)'
                : '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            ENTER ARENA
          </span>
        </button>

        {/* Subtitle Text - below button, larger and bold, minimal shadow */}
        <p
          className="text-center select-none font-bold"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#ff3366',
            letterSpacing: '0.22em',
            textShadow: '1px 1px 0px #000',
            marginTop: '1.5rem',
          }}
        >
          PREPARE YOUR CODE. ENTER THE ARENA.
        </p>
      </div>

      
    </div>
  );
}