// components/three/ThreeDScene.tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function ParticleField({ count = 500 }) {
  const points = useRef<THREE.Points>(null!);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 0.2;
    
    if (points.current) {
      points.current.rotation.y = time * 0.1;
      
      const positions = points.current.geometry.attributes.position;
      const initialPositions = points.current.userData.initialPositions;
      
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        
        // Apply sine wave movement to each particle
        positions.array[i3 + 1] = initialPositions[i3 + 1] + 
          Math.sin(time + initialPositions[i3]) * 0.3;
      }
      
      positions.needsUpdate = true;
    }
  });
  
  // Create a random particle field
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 15;      // x
    positions[i + 1] = (Math.random() - 0.5) * 15;  // y
    positions[i + 2] = (Math.random() - 0.5) * 15;  // z
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Store initial positions for animation
  const initialPositions = positions.slice();
  
  return (
    <points ref={points} userData={{ initialPositions }}>
      <bufferGeometry attach="geometry" attributes={{
        position: new THREE.BufferAttribute(positions, 3)
      }} />
      <pointsMaterial 
        attach="material" 
        size={0.1} 
        color="#00ffff" 
        transparent 
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Grid() {
  return (
    <group position={[0, -4, 0]}>
      <gridHelper args={[30, 30, "#00ffff", "#00ffff"]} />
    </group>
  );
}

function SpinningCube() {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    mesh.current.rotation.x = time * 0.3;
    mesh.current.rotation.y = time * 0.5;
    mesh.current.position.y = Math.sin(time * 0.5) * 0.5 + 1;
  });
  
  return (
    <mesh ref={mesh} position={[0, 1, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export function ThreeDScene() {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 5, 30]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        
        <ParticleField />
        <Grid />
        <SpinningCube />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
