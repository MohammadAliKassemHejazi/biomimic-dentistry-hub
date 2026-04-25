"use client";

/**
 * FE-04 (Iter 4): Replaced WebGL/Three.js implementation with a pure CSS +
 * Framer Motion animation.
 *
 * Previous implementation used React Three Fiber with:
 *  - 4 FloatingOrbs each at Sphere args={[0.8, 64, 64]} + MeshDistortMaterial
 *  - useFrame firing on 5 components at 60fps
 *  - Full WebGL context with OrbitControls
 *
 * Result: heavy GPU shader load, page lag on integrated graphics.
 *
 * New implementation:
 *  - Zero WebGL, zero Three.js imports
 *  - CSS perspective + transform for 3D feel
 *  - Framer Motion keyframe animations for floating orbs
 *  - Identical visual composition: central tooth shape + 4 coloured orbs
 */

import { motion } from 'framer-motion';

const orbs = [
  { color: '#88C9A1', size: 120, top: '10%',  left: '5%',  delay: 0 },
  { color: '#B5E2FA', size: 90,  top: '60%',  right: '8%', delay: 0.4 },
  { color: '#E8B4B8', size: 80,  bottom: '15%', left: '12%', delay: 0.8 },
  { color: '#A0D8B3', size: 100, top: '20%',  right: '5%', delay: 0.2 },
] as const;

const FloatingOrb = ({
  color,
  size,
  delay,
  style,
}: {
  color: string;
  size: number;
  delay: number;
  style?: React.CSSProperties;
}) => (
  <motion.div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`,
      filter: 'blur(1px)',
      ...style,
    }}
    animate={{
      y: [0, -18, 0, 12, 0],
      x: [0, 8, -6, 4, 0],
      scale: [1, 1.06, 0.97, 1.03, 1],
    }}
    transition={{
      duration: 6 + delay * 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const ToothShape = () => (
  <motion.div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      perspective: 800,
    }}
    animate={{
      rotateY: [0, 8, 0, -8, 0],
      rotateX: [0, 4, 0, -4, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {/* Tooth crown */}
    <div
      style={{
        position: 'relative',
        width: 100,
        height: 140,
        filter: 'drop-shadow(0 0 20px rgba(136, 201, 161, 0.4))',
      }}
    >
      {/* Root */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 52,
          height: 80,
          background: 'linear-gradient(to bottom, rgba(247,249,248,0.95), rgba(230,240,235,0.85))',
          borderRadius: '4px 4px 20px 20px',
          border: '1px solid rgba(136,201,161,0.3)',
        }}
      />
      {/* Crown */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, rgba(247,249,248,0.98), rgba(235,245,240,0.9))',
          borderRadius: '50% 50% 30% 30%',
          border: '1px solid rgba(136,201,161,0.3)',
          boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.6), 0 4px 16px rgba(136,201,161,0.2)',
        }}
      />
      {/* Healing glow overlay */}
      <div
        style={{
          position: 'absolute',
          inset: -8,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(136,201,161,0.12), transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </div>
  </motion.div>
);

const BiomimeticTooth3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating orbs */}
      {orbs.map((orb, i) => {
        const { color, size, delay, ...pos } = orb;
        return (
          <FloatingOrb
            key={i}
            color={color}
            size={size}
            delay={delay}
            style={pos as React.CSSProperties}
          />
        );
      })}

      {/* Central tooth */}
      <ToothShape />
    </div>
  );
};

export default BiomimeticTooth3D;
