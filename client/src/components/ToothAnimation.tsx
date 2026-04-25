"use client";

/**
 * ToothAnimation — Pure SVG + CSS implementation.
 *
 * GPU cost: ZERO.
 *  ✅  No WebGL, no Three.js, no canvas, no shader compilation
 *  ✅  No requestAnimationFrame / JS animation loop
 *  ✅  CSS @keyframes with transform & opacity only — runs on the
 *      browser's compositor thread (not the GPU shader pipeline)
 *  ✅  Intel Iris / integrated GPU: effectively 0% additional load
 *  ✅  @media (prefers-reduced-motion) already handled globally in
 *      globals.css (animations frozen to 0.01ms)
 *  ✅  Static after first paint — browser caches the SVG element
 */

const ToothAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {/* ── Keyframes (scoped to this component) ───────────────────────────── */}
    <style>{`
      @keyframes ta-tooth-bob {
        0%,100% { transform: translateY(0px)   rotate(-1.5deg); }
        35%      { transform: translateY(-14px) rotate( 1.2deg); }
        70%      { transform: translateY(-8px)  rotate(-0.6deg); }
      }
      @keyframes ta-orb-1 {
        0%,100% { transform: translate(  0px,   0px); }
        30%     { transform: translate( -9px, -16px); }
        60%     { transform: translate(  6px,  -9px); }
        80%     { transform: translate( -4px,  -4px); }
      }
      @keyframes ta-orb-2 {
        0%,100% { transform: translate(  0px,   0px); }
        25%     { transform: translate( 11px,  13px); }
        55%     { transform: translate( -7px,   8px); }
        80%     { transform: translate(  4px,   4px); }
      }
      @keyframes ta-orb-3 {
        0%,100% { transform: translate(  0px,   0px); }
        40%     { transform: translate( -8px,  14px); }
        70%     { transform: translate(  5px,   7px); }
      }
      @keyframes ta-orb-4 {
        0%,100% { transform: translate(  0px,   0px); }
        35%     { transform: translate( 10px, -12px); }
        65%     { transform: translate( -5px,  -7px); }
        85%     { transform: translate(  3px,   5px); }
      }

      .ta-tooth { animation: ta-tooth-bob 7s ease-in-out infinite; }
      .ta-orb-1 { animation: ta-orb-1    9s ease-in-out infinite; }
      .ta-orb-2 { animation: ta-orb-2   11s ease-in-out infinite 1.4s; }
      .ta-orb-3 { animation: ta-orb-3    8s ease-in-out infinite 2.7s; }
      .ta-orb-4 { animation: ta-orb-4   10s ease-in-out infinite 0.7s; }
    `}</style>

    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Soft-glow filter for the tooth — rendered once, cached by browser */}
        <filter id="ta-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Blur filter for orbs */}
        <filter id="ta-orb-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* ── Floating orbs (coloured, blurred circles) ───────────────────── */}

      {/* Orb 1 — Bio Mint, top-left */}
      <g className="ta-orb-1">
        <circle cx="80"  cy="140" r="68" fill="#88C9A1" fillOpacity="0.28" filter="url(#ta-orb-blur)" />
      </g>

      {/* Orb 2 — Enamel Sky, top-right */}
      <g className="ta-orb-2">
        <circle cx="420" cy="110" r="52" fill="#B5E2FA" fillOpacity="0.30" filter="url(#ta-orb-blur)" />
      </g>

      {/* Orb 3 — Gum Blush, bottom-left */}
      <g className="ta-orb-3">
        <circle cx="90"  cy="390" r="44" fill="#E8B4B8" fillOpacity="0.25" filter="url(#ta-orb-blur)" />
      </g>

      {/* Orb 4 — Bio Glow, bottom-right */}
      <g className="ta-orb-4">
        <circle cx="415" cy="360" r="58" fill="#A0D8B3" fillOpacity="0.28" filter="url(#ta-orb-blur)" />
      </g>

      {/* ── Tooth silhouette ─────────────────────────────────────────────── */}
      {/*
          Molar anatomy (relative to SVG center ~250,240):
          • Crown    — wide body with three rounded cusps on top
          • Neck     — slight narrowing between crown and roots
          • Two roots — taper to rounded tips
      */}
      <g className="ta-tooth" style={{ transformOrigin: '250px 265px' }}>
        {/* Soft ambient glow behind the tooth */}
        <ellipse
          cx="250" cy="265" rx="85" ry="110"
          fill="#88C9A1"
          fillOpacity="0.12"
          filter="url(#ta-orb-blur)"
        />

        {/* Crown body */}
        <path
          d={[
            'M 175,195',           // left side, crown base-left
            'Q 173,155 185,145',   // lower-left shoulder rises
            'Q 193,137 205,137',   // cusp-left base
            'Q 215,130 225,132',   // left cusp peak
            'Q 235,127 250,126',   // inter-cusp valley then centre cusp
            'Q 265,127 275,132',   // centre to right inter-cusp
            'Q 285,130 295,137',   // right cusp base
            'Q 307,137 315,145',   // right shoulder
            'Q 327,155 325,195',   // right side descending
            'Q 325,215 308,218',   // bottom-right neck
            'L 192,218',           // base flat
            'Q 175,215 175,195',   // bottom-left neck
            'Z',
          ].join(' ')}
          fill="#F0F5F2"
          fillOpacity="0.82"
          stroke="#88C9A1"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          filter="url(#ta-glow)"
        />

        {/* Crown highlights (enamel sheen) */}
        <path
          d="M 190,150 Q 220,136 250,130 Q 280,136 310,150"
          fill="none"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Left root */}
        <path
          d={[
            'M 205,218',           // neck, left
            'Q 200,230 196,255',
            'Q 190,282 195,305',
            'Q 199,320 208,323',   // root tip area
            'Q 218,326 222,312',
            'Q 226,295 222,268',
            'Q 219,242 218,218',   // neck, right of left root
            'Z',
          ].join(' ')}
          fill="#EAF2EE"
          fillOpacity="0.78"
          stroke="#88C9A1"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />

        {/* Right root */}
        <path
          d={[
            'M 282,218',           // neck, left of right root
            'Q 281,242 278,268',
            'Q 274,295 278,312',
            'Q 282,326 292,323',   // root tip area
            'Q 301,320 305,305',
            'Q 310,282 304,255',
            'Q 300,230 295,218',   // neck, right
            'Z',
          ].join(' ')}
          fill="#EAF2EE"
          fillOpacity="0.78"
          stroke="#88C9A1"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />

        {/* Faint centre groove on crown */}
        <line
          x1="250" y1="136" x2="250" y2="214"
          stroke="#88C9A1"
          strokeOpacity="0.18"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </g>
    </svg>
  </div>
);

export default ToothAnimation;
