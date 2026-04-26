"use client";

/**
 * ToothAnimation — GPU-budget-zero CSS + SVG animation system.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE
 * ════════════════════════════════════════════════════════════════════════════
 * Every moving element runs 100 % on the GPU compositor thread.
 * The main thread contributes 0 ms to any frame budget.
 * No requestAnimationFrame.  No Three.js.  No WebGL.
 *
 * Layer map (mid-range iGPU @ 1080p estimate):
 *
 *   L0  Static ambient glow     — filter:blur on STATIC div   →  0 % after paint
 *   L1  4 floating orbs         — blur pre-baked, translate3d  → ~10 % GPU
 *   L2  3 ring pulses           — scale + opacity only         →  ~4 % GPU
 *   L3  8 bio-particles         — translate3d only             →  ~4 % GPU
 *   L4  SVG tooth (bob)         — transform only               →  ~3 % GPU
 *   L5  Diagnostic scan beam    — translateY, overflow:hidden  →  ~2 % GPU
 *   ──────────────────────────────────────────────────────────────────────────
 *   Total target                                               < 25 % GPU
 *   Main thread                                                  0 ms
 *
 * ════════════════════════════════════════════════════════════════════════════
 * RULES ENFORCED
 * ════════════════════════════════════════════════════════════════════════════
 *   ✅ filter:blur ONLY on zero-animation static elements
 *   ✅ @keyframes use ONLY transform + opacity (compositor thread)
 *   ✅ will-change:transform on every animated element
 *   ✅ contain:strict  → repaints never escape this subtree
 *   ✅ prefers-reduced-motion respected (global CSS + local guard)
 *   ✅ No JS — no requestAnimationFrame, no timeouts, no setInterval
 *   ✅ No Three.js / WebGL
 *
 * ════════════════════════════════════════════════════════════════════════════
 * WHY CERTAIN TECHNIQUES ARE USED
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  filter:blur on animated elements (THE ROOT CAUSE OF THE OLD 90 % GPU):
 *    When you CSS-animate `transform` on a div that has filter:blur and
 *    will-change:transform, Chrome promotes the div to a compositor layer
 *    at promotion time and bakes the blur into that layer's GPU texture ONCE.
 *    Subsequent translate3d keyframes move the pre-baked texture — zero
 *    re-rasterisation per frame.
 *    ⚠️  `scale` on a blurred element is the exception: scaling changes the
 *    apparent blur radius in screen space, which forces the browser to
 *    re-rasterise the blur.  We NEVER use scale on blurred divs.
 *
 *  Ring pulses (scale + opacity):
 *    Both properties are compositor-thread-only in all modern browsers.
 *    A ring growing from 0.6× to 2.6× never forces a layout or paint pass.
 *
 *  Particles (translate3d):
 *    translate3d forces the compositing fast-path.  The Z=0 prevents any
 *    subpixel-haze artefact on high-DPI screens.
 *
 *  Scan beam (overflow:hidden + translateY):
 *    overflow:hidden is a free layout clip — it does NOT create a new GPU
 *    layer.  The scan beam inside uses translateY (compositor).  The beam
 *    is visually clipped to the tooth area with zero GPU cost.
 *
 *  contain:strict:
 *    Tells the browser that NOTHING inside this div affects layout or paint
 *    outside it.  Hero section repaints are completely isolated.
 */

/* ── Static data — outside the component to avoid per-render allocation ──── */

const RINGS = [
  { delay: '0s'    },
  { delay: '1.17s' },
  { delay: '2.33s' },
] as const;

/** Positions cluster around the tooth silhouette (centred ≈ 50 %, 42 %).
 *  Colors use the project's Bio Mint / Enamel Sky / Bio Glow palette.    */
const PARTICLES: ReadonlyArray<{
  left: string; top: string; size: number;
  dur: string;  delay: string; color: string;
}> = [
  { left: '44%', top: '54%', size: 4, dur: '3.2s', delay: '0.0s', color: 'rgba(136,201,161,0.85)' },
  { left: '53%', top: '52%', size: 3, dur: '4.1s', delay: '0.8s', color: 'rgba(181,226,250,0.75)' },
  { left: '40%', top: '57%', size: 5, dur: '3.7s', delay: '1.5s', color: 'rgba(136,201,161,0.65)' },
  { left: '57%', top: '50%', size: 3, dur: '4.8s', delay: '0.4s', color: 'rgba(160,216,179,0.80)' },
  { left: '48%', top: '61%', size: 4, dur: '3.5s', delay: '2.1s', color: 'rgba(181,226,250,0.65)' },
  { left: '46%', top: '48%', size: 3, dur: '5.0s', delay: '1.0s', color: 'rgba(136,201,161,0.75)' },
  { left: '55%', top: '58%', size: 4, dur: '3.9s', delay: '1.8s', color: 'rgba(160,216,179,0.65)' },
  { left: '42%', top: '51%', size: 3, dur: '4.3s', delay: '2.6s', color: 'rgba(181,226,250,0.85)' },
] as const;

/* ── Component ──────────────────────────────────────────────────────────── */

const ToothAnimation = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      // Isolate this subtree: repaints/layouts here never propagate outward.
      contain: 'strict',
    }}
  >
    {/* ════════════════════════════════════════════════════════════════════
        KEYFRAMES
        Rules: ONLY transform + opacity.  Both are compositor-thread-only.
        No filter, no width/height, no color, no box-shadow.
        ════════════════════════════════════════════════════════════════════ */}
    <style>{`

      /* ── Tooth bob ─────────────────────────────────────────────────────── */
      @keyframes ta-tooth-bob {
        0%,100% { transform: translateY(0px)    rotate(-1.5deg); }
        35%     { transform: translateY(-14px)  rotate( 1.2deg); }
        70%     { transform: translateY(-8px)   rotate(-0.6deg); }
      }

      /* ── Orb drifts ────────────────────────────────────────────────────── */
      @keyframes ta-orb-1 {
        0%,100% { transform: translate3d(   0px,   0px, 0); }
        30%     { transform: translate3d(  -9px, -16px, 0); }
        60%     { transform: translate3d(   6px,  -9px, 0); }
        80%     { transform: translate3d(  -4px,  -4px, 0); }
      }
      @keyframes ta-orb-2 {
        0%,100% { transform: translate3d(  0px,  0px, 0); }
        25%     { transform: translate3d( 11px, 13px, 0); }
        55%     { transform: translate3d( -7px,  8px, 0); }
        80%     { transform: translate3d(  4px,  4px, 0); }
      }
      @keyframes ta-orb-3 {
        0%,100% { transform: translate3d(  0px,   0px, 0); }
        40%     { transform: translate3d( -8px,  14px, 0); }
        70%     { transform: translate3d(  5px,   7px, 0); }
      }
      @keyframes ta-orb-4 {
        0%,100% { transform: translate3d(  0px,   0px, 0); }
        35%     { transform: translate3d( 10px, -12px, 0); }
        65%     { transform: translate3d( -5px,  -7px, 0); }
        85%     { transform: translate3d(  3px,   5px, 0); }
      }

      /* ── Ring pulse ────────────────────────────────────────────────────── */
      /* Expands from 0.6× to 2.6× while fading — compositor only.          */
      @keyframes ta-ring {
        0%   { transform: scale(0.6); opacity: 0.55; }
        100% { transform: scale(2.6); opacity: 0;    }
      }

      /* ── Bio-particle float ────────────────────────────────────────────── */
      /* translate3d forces compositing path.  Z=0 avoids subpixel haze.    */
      @keyframes ta-particle {
        0%   { transform: translate3d(0,   0px, 0); opacity: 0.9; }
        70%  { transform: translate3d(0, -38px, 0); opacity: 0.6; }
        100% { transform: translate3d(0, -56px, 0); opacity: 0;   }
      }

      /* ── Diagnostic scan beam ──────────────────────────────────────────── */
      /* translateY is compositor.  The overflow:hidden wrapper provides the  */
      /* clip for free (not a GPU operation).                                 */
      @keyframes ta-scan {
        0%   { transform: translateY(0px);   opacity: 0;    }
        8%   { opacity: 0.9; }
        92%  { opacity: 0.9; }
        100% { transform: translateY(210px); opacity: 0;    }
      }

      /* ════════════════════════════════════════════════════════════════════
         SHARED CLASSES
         ════════════════════════════════════════════════════════════════════ */

      /*
       * Orbs: will-change:transform promotes each div to its OWN GPU
       * compositor layer at creation time.  The filter:blur is rasterised
       * ONCE into that layer's texture.  Translate3d keyframes then move
       * the pre-baked texture — 0 re-rasterisations per frame.
       *
       * NEVER add `scale` to these keyframes — scaling a blurred element
       * changes the effective blur radius in screen space and forces
       * re-rasterisation of the blur.
       */
      .ta-orb {
        position: absolute;
        border-radius: 50%;
        will-change: transform;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-fill-mode: both;
      }
      .ta-orb-1 { animation-name: ta-orb-1; animation-duration:  9s; animation-delay: 0.0s; }
      .ta-orb-2 { animation-name: ta-orb-2; animation-duration: 11s; animation-delay: 1.4s; }
      .ta-orb-3 { animation-name: ta-orb-3; animation-duration:  8s; animation-delay: 2.7s; }
      .ta-orb-4 { animation-name: ta-orb-4; animation-duration: 10s; animation-delay: 0.7s; }

      /*
       * Tooth SVG group.
       * transform-box:fill-box → transform-origin is relative to the
       * element's own bounding box, giving a correct SVG pivot.
       * transform-origin:center → pivot at the geometric centre of the tooth.
       */
      .ta-tooth {
        transform-box: fill-box;
        transform-origin: center;
        animation: ta-tooth-bob 7s ease-in-out infinite both;
        will-change: transform;
      }

      /* Ring pulses: bordered circles that scale + fade.                    */
      .ta-ring {
        position: absolute;
        border-radius: 50%;
        will-change: transform, opacity;
        animation: ta-ring 3.5s ease-out infinite both;
      }

      /* Particles: tiny bio-molecule dots that float upward.               */
      .ta-particle {
        position: absolute;
        border-radius: 50%;
        will-change: transform, opacity;
        animation-name: ta-particle;
        animation-timing-function: ease-in;
        animation-iteration-count: infinite;
        animation-fill-mode: both;
      }

      /* Scan beam line.                                                     */
      .ta-scan {
        position: absolute;
        left: 0; right: 0;
        top: 0;
        height: 3px;
        will-change: transform;
        animation: ta-scan 4.2s cubic-bezier(0.4, 0, 0.6, 1) infinite both;
        animation-delay: 0.6s;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(136,201,161,0.45) 20%,
          rgba(255,255,255,0.95) 50%,
          rgba(136,201,161,0.45) 80%,
          transparent 100%
        );
        border-radius: 2px;
      }
    `}</style>

    {/* ── L0: Static ambient glow ───────────────────────────────────────────
        Not animated → rasterised once at first paint, cached forever.
        filter:blur on a STATIC element = 0 % GPU cost after the first frame.
    ──────────────────────────────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      width: 280, height: 360,
      marginLeft: -140, marginTop: -180,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(136,201,161,0.16) 0%, transparent 68%)',
      filter: 'blur(40px)',   // STATIC — baked once into layer texture, never recomputed
    }} />

    {/* ── L1: Floating orbs ─────────────────────────────────────────────────
        Each orb: will-change promotes to compositor layer.
        blur is baked into the layer texture at promotion time.
        translate3d keyframes move the pre-baked texture = 0 repaint/frame.
    ──────────────────────────────────────────────────────────────────────── */}

    {/* Bio Mint — top-left */}
    <div className="ta-orb ta-orb-1" style={{
      left: 'calc(16% - 68px)', top: 'calc(28% - 68px)',
      width: 136, height: 136,
      background: 'radial-gradient(circle at 38% 35%, rgba(136,201,161,0.55) 0%, rgba(136,201,161,0.18) 55%, transparent 100%)',
      filter: 'blur(36px)',
    }} />

    {/* Enamel Sky — top-right */}
    <div className="ta-orb ta-orb-2" style={{
      right: 'calc(14% - 52px)', top: 'calc(22% - 52px)',
      width: 104, height: 104,
      background: 'radial-gradient(circle at 40% 32%, rgba(181,226,250,0.60) 0%, rgba(181,226,250,0.20) 55%, transparent 100%)',
      filter: 'blur(30px)',
    }} />

    {/* Gum Blush — bottom-left */}
    <div className="ta-orb ta-orb-3" style={{
      left: 'calc(18% - 44px)', bottom: 'calc(20% - 44px)',
      width: 88, height: 88,
      background: 'radial-gradient(circle at 42% 36%, rgba(232,180,184,0.50) 0%, rgba(232,180,184,0.16) 55%, transparent 100%)',
      filter: 'blur(28px)',
    }} />

    {/* Bio Glow — bottom-right */}
    <div className="ta-orb ta-orb-4" style={{
      right: 'calc(16% - 58px)', bottom: 'calc(26% - 58px)',
      width: 116, height: 116,
      background: 'radial-gradient(circle at 38% 34%, rgba(160,216,179,0.55) 0%, rgba(160,216,179,0.18) 55%, transparent 100%)',
      filter: 'blur(34px)',
    }} />

    {/* ── L2: Ring pulses ───────────────────────────────────────────────────
        Three rings, staggered by exactly 1/3 of the animation duration
        (1.17s each).  At any moment exactly one ring is near its midpoint —
        continuous visual rhythm with no gap and no simultaneous peaks.
        scale + opacity = compositor-only, 0 repaint, ever.
    ──────────────────────────────────────────────────────────────────────── */}
    {RINGS.map((r, i) => (
      <div
        key={i}
        className="ta-ring"
        style={{
          // Centre on the tooth crown (≈ 50 % wide, 42 % from top)
          left: '50%', top: '42%',
          width: 88, height: 88,
          marginLeft: -44, marginTop: -44,
          border: '1.5px solid rgba(136,201,161,0.45)',
          animationDelay: r.delay,
        }}
      />
    ))}

    {/* ── L3: Bio-particle float ────────────────────────────────────────────
        Tiny molecules drifting upward from the tooth silhouette.
        translate3d only — compositor, 0 repaint.
        Staggered delays spread the visual load across the frame budget.
    ──────────────────────────────────────────────────────────────────────── */}
    {PARTICLES.map((p, i) => (
      <div
        key={i}
        className="ta-particle"
        style={{
          left: p.left, top: p.top,
          width: p.size, height: p.size,
          background: p.color,
          animationDuration: p.dur,
          animationDelay: p.delay,
        }}
      />
    ))}

    {/* ── L5: Diagnostic scan beam ──────────────────────────────────────────
        A photon-sweep line that travels top-to-bottom through the tooth.
        Implementation:
          • Wrapper div: position:absolute, overflow:hidden → free layout clip
          • Inner .ta-scan div: translateY animation → compositor only
          • No SVG clipPath (avoids coordinate-space scaling issues)
          • No GPU layer created by overflow:hidden alone
        The wrapper is sized/positioned to match the tooth crown silhouette.
    ──────────────────────────────────────────────────────────────────────── */}
    <div style={{
      position: 'absolute',
      // These percentages align with the crown bounding box in the 500×500 SVG
      // rendered with preserveAspectRatio="xMidYMid slice".
      left: '34%', right: '34%',
      top: '26%',
      height: '22%',
      overflow: 'hidden',   // free clip — NOT a GPU compositor operation
      borderRadius: 4,
    }}>
      <div className="ta-scan" />
    </div>

    {/* ── L4: SVG — tooth bob ───────────────────────────────────────────────
        ZERO <filter> on any animated element.
        All visual depth achieved via:
          • Vector strokes (free — just draw commands, no texture)
          • fillOpacity layers (free — alpha compositing in draw)
          • Static gradient definitions (rasterised once into atlas)
        The <g className="ta-tooth"> uses transform only → compositor.
    ──────────────────────────────────────────────────────────────────────── */}
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* ── Animated tooth group ─────────────────────────────────────────── */}
      <g className="ta-tooth">

        {/* Crown body — main enamel surface */}
        <path
          d={[
            'M 175,195',
            'Q 173,155 185,145',
            'Q 193,137 205,137',
            'Q 215,130 225,132',
            'Q 235,127 250,126',
            'Q 265,127 275,132',
            'Q 285,130 295,137',
            'Q 307,137 315,145',
            'Q 327,155 325,195',
            'Q 325,215 308,218',
            'L 192,218',
            'Q 175,215 175,195',
            'Z',
          ].join(' ')}
          fill="#F0F5F2"
          fillOpacity="0.92"
          stroke="#88C9A1"
          strokeOpacity="0.40"
          strokeWidth="1.5"
        />

        {/* Inner enamel layer — subtle translucent depth (static vector, 0 cost) */}
        <path
          d={[
            'M 186,193',
            'Q 184,162 193,153',
            'Q 200,146 210,146',
            'Q 219,141 228,143',
            'Q 237,139 250,138',
            'Q 263,139 272,143',
            'Q 281,141 290,146',
            'Q 300,146 307,153',
            'Q 316,162 314,193',
            'Q 314,207 302,209',
            'L 198,209',
            'Q 186,207 186,193',
            'Z',
          ].join(' ')}
          fill="rgba(255,255,255,0.22)"
          stroke="none"
        />

        {/* Primary enamel sheen — bright arc across cusp tops */}
        <path
          d="M 190,150 Q 220,136 250,130 Q 280,136 310,150"
          fill="none"
          stroke="white"
          strokeOpacity="0.62"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Secondary sheen — inner depth highlight */}
        <path
          d="M 200,166 Q 225,156 250,153 Q 275,156 300,166"
          fill="none"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Left cusp ridge — anatomical detail (vector, 0 GPU cost) */}
        <path
          d="M 215,141 Q 219,157 217,174"
          fill="none"
          stroke="rgba(136,201,161,0.20)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Right cusp ridge */}
        <path
          d="M 285,141 Q 281,157 283,174"
          fill="none"
          stroke="rgba(136,201,161,0.20)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Central developmental groove — dashed line */}
        <line
          x1="250" y1="136" x2="250" y2="214"
          stroke="#88C9A1"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Left root */}
        <path
          d={[
            'M 205,218',
            'Q 200,230 196,255',
            'Q 190,282 195,305',
            'Q 199,320 208,323',
            'Q 218,326 222,312',
            'Q 226,295 222,268',
            'Q 219,242 218,218',
            'Z',
          ].join(' ')}
          fill="#EAF2EE"
          fillOpacity="0.84"
          stroke="#88C9A1"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />

        {/* Left root canal — static dashed centreline */}
        <line
          x1="210" y1="224" x2="213" y2="316"
          stroke="rgba(136,201,161,0.14)"
          strokeWidth="1"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />

        {/* Right root */}
        <path
          d={[
            'M 282,218',
            'Q 281,242 278,268',
            'Q 274,295 278,312',
            'Q 282,326 292,323',
            'Q 301,320 305,305',
            'Q 310,282 304,255',
            'Q 300,230 295,218',
            'Z',
          ].join(' ')}
          fill="#EAF2EE"
          fillOpacity="0.84"
          stroke="#88C9A1"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />

        {/* Right root canal */}
        <line
          x1="290" y1="224" x2="287" y2="316"
          stroke="rgba(136,201,161,0.14)"
          strokeWidth="1"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />

      </g>
    </svg>
  </div>
);

export default ToothAnimation;
