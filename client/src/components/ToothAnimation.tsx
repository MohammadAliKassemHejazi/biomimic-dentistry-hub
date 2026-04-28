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
 *   Total target (VISIBLE)                                     < 25 % GPU
 *   Total target (OFF-SCREEN)                                    ~0 % GPU
 *   Main thread                                                  0 ms
 *
 * ════════════════════════════════════════════════════════════════════════════
 * GPU CACHING — INTERSECTIONOBSERVER STRATEGY
 * ════════════════════════════════════════════════════════════════════════════
 *   CSS `will-change: transform` keeps compositor layers GPU-resident even
 *   when the element is scrolled 3000 px out of view.  On Intel Iris and
 *   other shared-memory GPUs this wastes 40–80 MB of texture memory.
 *
 *   Fix: an IntersectionObserver on the container div:
 *     • OFF-SCREEN → animationPlayState = 'paused', willChange = 'auto'
 *       The browser de-promotes each layer, releases the GPU texture, and
 *       stops all compositing work for this subtree.  Zero GPU overhead.
 *     • ON-SCREEN  → animationPlayState = '', willChange = ''
 *       Removes the inline override; CSS class values take effect again.
 *       Layers are re-promoted and animations resume seamlessly.
 *
 *   rootMargin: '50px' — start resuming 50 px before the element enters the
 *   viewport so the animation is already running when the user sees it.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * RULES ENFORCED
 * ════════════════════════════════════════════════════════════════════════════
 *   ✅ filter:blur ONLY on zero-animation static elements
 *   ✅ @keyframes use ONLY transform + opacity (compositor thread)
 *   ✅ will-change:transform on every animated element (CSS class)
 *   ✅ contain:strict  → repaints never escape this subtree
 *   ✅ prefers-reduced-motion respected (global CSS + local JS guard)
 *   ✅ IntersectionObserver disconnected on component unmount
 *   ✅ No JS animation loop — no requestAnimationFrame, no setInterval
 *   ✅ No Three.js / WebGL
 */

import { useEffect, useRef } from 'react';

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

/** CSS selector for all animated elements inside this component. */
const ANIMATED_SELECTOR = '.ta-orb, .ta-tooth, .ta-ring, .ta-particle, .ta-scan';

/* ── Component ──────────────────────────────────────────────────────────── */

const ToothAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── ANIM-GPU-01: IntersectionObserver GPU cache ───────────────────────
    // Do NOT override CSS when user prefers reduced motion — the CSS
    // @media rule already sets animation:none on all .ta-* elements.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const animated = container.querySelectorAll<HTMLElement>(ANIMATED_SELECTOR);

        if (entry.isIntersecting) {
          // Restore to CSS class values — layers re-promote, animations resume.
          animated.forEach((el) => {
            el.style.animationPlayState = '';  // CSS class wins
            el.style.willChange = '';          // CSS class wins
          });
        } else {
          // Pause + de-promote: zero GPU overhead while off-screen.
          animated.forEach((el) => {
            el.style.animationPlayState = 'paused';
            el.style.willChange = 'auto';  // overrides CSS class → de-promotes layer
          });
        }
      },
      {
        threshold: 0,
        // Start resuming 50px before the element enters the viewport
        // so animation is already running when the user sees it.
        rootMargin: '50px 0px',
      },
    );

    observer.observe(container);

    // CRITICAL: disconnect on unmount — otherwise the callback is called
    // after the component is gone and querySelectorAll throws.
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
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
         * compositor layer at creation time.  The radial-gradient fill is
         * rasterised ONCE into that layer's texture (zero filter cost).
         * Translate3d keyframes then move the pre-baked texture — 0
         * re-rasterisations per frame.
         *
         * NO filter:blur on any orb — blur forces re-rasterisation on
         * Intel / low-end iGPUs even with will-change promotion.
         * Visual softness is achieved via multi-stop radial gradients.
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

        /* ════════════════════════════════════════════════════════════════════
           REDUCED MOTION — stronger than the global 0.01ms trick.
           animation:none removes compositor layer promotions entirely,
           leaving zero GPU overhead for users who prefer no motion.
           ════════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .ta-orb,
          .ta-tooth,
          .ta-ring,
          .ta-particle,
          .ta-scan {
            animation: none !important;
            will-change: auto !important;
          }
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
          ZERO filter:blur on any of these elements.
          Each orb is a larger radial-gradient-only div sized to reproduce the
          original visible spread without any GPU blur computation.
          Sizing formula: new_diameter = 2 × (original_radius + 2.5 × blur_radius)
            Bio Mint:   r=68,  blur=36 → effective ~158 px → 300 px element
            Enamel Sky: r=52,  blur=30 → effective ~127 px → 240 px element
            Gum Blush:  r=44,  blur=28 → effective ~114 px → 220 px element
            Bio Glow:   r=58,  blur=34 → effective ~143 px → 280 px element
          The radial gradient is rasterised ONCE at layer creation, never again.
          translate3d keyframes move the pre-baked texture = 0 re-rasterisation.
      ──────────────────────────────────────────────────────────────────────── */}

      {/* Bio Mint — top-left */}
      <div className="ta-orb ta-orb-1" style={{
        left: 'calc(16% - 150px)', top: 'calc(28% - 150px)',
        width: 300, height: 300,
        background: 'radial-gradient(circle at 38% 35%, rgba(136,201,161,0.36) 0%, rgba(136,201,161,0.12) 35%, rgba(136,201,161,0.03) 62%, transparent 80%)',
      }} />

      {/* Enamel Sky — top-right */}
      <div className="ta-orb ta-orb-2" style={{
        right: 'calc(14% - 120px)', top: 'calc(22% - 120px)',
        width: 240, height: 240,
        background: 'radial-gradient(circle at 40% 32%, rgba(181,226,250,0.40) 0%, rgba(181,226,250,0.13) 35%, rgba(181,226,250,0.03) 62%, transparent 80%)',
      }} />

      {/* Gum Blush — bottom-left */}
      <div className="ta-orb ta-orb-3" style={{
        left: 'calc(18% - 110px)', bottom: 'calc(20% - 110px)',
        width: 220, height: 220,
        background: 'radial-gradient(circle at 42% 36%, rgba(232,180,184,0.34) 0%, rgba(232,180,184,0.11) 35%, rgba(232,180,184,0.03) 62%, transparent 80%)',
      }} />

      {/* Bio Glow — bottom-right */}
      <div className="ta-orb ta-orb-4" style={{
        right: 'calc(16% - 140px)', bottom: 'calc(26% - 140px)',
        width: 280, height: 280,
        background: 'radial-gradient(circle at 38% 34%, rgba(160,216,179,0.36) 0%, rgba(160,216,179,0.12) 35%, rgba(160,216,179,0.03) 62%, transparent 80%)',
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
};

export default ToothAnimation;
