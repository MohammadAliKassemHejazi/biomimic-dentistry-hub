import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FloatingOrb = ({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.8, 64, 64]}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.1}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
};

const ToothModel = () => {
  const toothRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (toothRef.current) {
      toothRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      toothRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group ref={toothRef} position={[0, 0, 0]}>
      {/* Main tooth body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 0.8, 3, 16]} />
        <meshStandardMaterial 
          color="#F7F9F8" 
          roughness={0.1} 
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Tooth crown */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshStandardMaterial 
          color="#F7F9F8" 
          roughness={0.1} 
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Healing glow effect */}
      <mesh position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
        <cylinderGeometry args={[1.3, 0.9, 3.2, 16]} />
        <meshStandardMaterial 
          color="#88C9A1" 
          transparent 
          opacity={0.2}
          emissive="#88C9A1"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

const BiomimeticTooth3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} color="#B5E2FA" />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          color="#F7F9F8"
          castShadow
        />
        <pointLight 
          position={[-5, -5, -5]} 
          intensity={0.3} 
          color="#88C9A1" 
        />
        
        {/* Main tooth model */}
        <ToothModel />
        
        {/* Floating organic orbs */}
        <FloatingOrb position={[-4, 2, -2]} color="#88C9A1" speed={0.8} />
        <FloatingOrb position={[4, -1, -1]} color="#B5E2FA" speed={1.2} />
        <FloatingOrb position={[-2, -3, 1]} color="#E8B4B8" speed={0.6} />
        <FloatingOrb position={[3, 3, 2]} color="#A0D8B3" speed={1.0} />
        
        {/* Auto-rotate controls */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default BiomimeticTooth3D;