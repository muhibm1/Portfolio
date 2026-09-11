import React from 'react';

export default function MmLogo({ size = 440, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      {/* Background Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none opacity-60 mix-blend-multiply transition-all duration-700 animate-iridescent"
        style={{
          background: 'radial-gradient(circle at 45% 45%, rgba(250, 203, 14, 0.45) 0%, rgba(240, 107, 168, 0.4) 35%, rgba(120, 186, 230, 0.35) 65%, transparent 85%)',
          filter: 'blur(38px)'
        }}
      />

      {/* SVG Architectural Blueprint & Interlocking MM Glyphs */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]"
      >
        <defs>
          {/* Gradient: Left to Right across the dual-M span */}
          <linearGradient id="mmGradientMain" x1="50" y1="200" x2="350" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#facb0e" />
            <stop offset="30%" stopColor="#fb923c" />
            <stop offset="55%" stopColor="#f06ba8" />
            <stop offset="80%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Depth Shading Gradient */}
          <linearGradient id="mmGradientDepth" x1="200" y1="80" x2="200" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#181818" stopOpacity="0.4" />
          </linearGradient>

          {/* Inner Glow Filter */}
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- BLUEPRINT / ARCHITECTURAL ALIGNMENT GUIDES --- */}
        {/* Outer subtle concentric circle */}
        <circle cx="200" cy="200" r="175" stroke="#d5d3ca" strokeWidth="1" strokeDasharray="3 4" opacity="0.85" />
        
        {/* Mid boundary circle */}
        <circle cx="200" cy="200" r="145" stroke="#c9c7bd" strokeWidth="1" opacity="0.9" />

        {/* Inner coordinate ring */}
        <circle cx="200" cy="200" r="110" stroke="#dedcd4" strokeWidth="0.75" strokeDasharray="1 3" />

        {/* Technical Axis Crosshairs */}
        <line x1="20" y1="200" x2="380" y2="200" stroke="#dcdad0" strokeWidth="1" strokeDasharray="4 6" opacity="0.8" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="#dcdad0" strokeWidth="1" strokeDasharray="4 6" opacity="0.8" />

        {/* Diagonal Ray Guidelines */}
        <line x1="75" y1="75" x2="325" y2="325" stroke="#e6e4dc" strokeWidth="0.75" strokeDasharray="2 4" />
        <line x1="75" y1="325" x2="325" y2="75" stroke="#e6e4dc" strokeWidth="0.75" strokeDasharray="2 4" />

        {/* Alignment Ticks & Cardinal Nodes */}
        <circle cx="200" cy="25" r="3" fill="#181818" />
        <circle cx="200" cy="375" r="3" fill="#181818" />
        <circle cx="25" cy="200" r="3" fill="#181818" />
        <circle cx="375" cy="200" r="3" fill="#181818" />

        <circle cx="75" cy="75" r="2" fill="#888" />
        <circle cx="325" cy="75" r="2" fill="#888" />
        <circle cx="75" cy="325" r="2" fill="#888" />
        <circle cx="325" cy="325" r="2" fill="#888" />

        {/* --- GEOMETRIC INTERLOCKING MM MARK --- */}
        {/* Underlay Shadow for 3D Dimension */}
        <g opacity="0.25" transform="translate(0, 10)">
          {/* M1 (Left / Back) */}
          <path
            d="M 90 290 L 90 115 L 155 230 L 215 115 L 215 290"
            stroke="#181818"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* M2 (Right / Interlocking) */}
          <path
            d="M 185 290 L 185 115 L 245 230 L 310 115 L 310 290"
            stroke="#181818"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* FIRST 'M' GLYPH (Left - Gold & Amber Transition) */}
        <path
          d="M 90 285 L 90 115 L 155 225 L 215 115 L 215 285"
          stroke="url(#mmGradientMain)"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#subtleGlow)"
        />

        {/* Core highlight stripe for M1 */}
        <path
          d="M 90 285 L 90 115 L 155 225 L 215 115 L 215 285"
          stroke="url(#mmGradientDepth)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* SECOND 'M' GLYPH (Right - Magenta & Electric Blue Transition, Interlocking) */}
        <path
          d="M 185 285 L 185 115 L 245 225 L 310 115 L 310 285"
          stroke="url(#mmGradientMain)"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#subtleGlow)"
        />

        {/* Core highlight stripe for M2 */}
        <path
          d="M 185 285 L 185 115 L 245 225 L 310 115 L 310 285"
          stroke="url(#mmGradientDepth)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Interlocking Bridge Node at Overlap Intersection (185, 170) */}
        <circle cx="185" cy="180" r="8" fill="#ffffff" stroke="#181818" strokeWidth="2.5" />
        <circle cx="215" cy="180" r="8" fill="#ffffff" stroke="#181818" strokeWidth="2.5" />

        {/* Central Systems Bridge Connector */}
        <line x1="185" y1="180" x2="215" y2="180" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

        {/* Apex Coordinates Text in Blueprint Style */}
        <text x="200" y="325" textAnchor="middle" fill="#787670" fontFamily="monospace" fontSize="9" letterSpacing="2">
          SYSTEM_CONDUIT // MM-440
        </text>
      </svg>
    </div>
  );
}
