// components/three/ThreeDBackground.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Grid floor that extends to infinity
function CyberGrid() {
  const gridSize = 20;
  const gridDivisions = 20;
  
  return (
    <group position={[0, -2, 0]}>
      <gridHelper 
        args={[gridSize, gridDivisions, "#00ffff", "#00ffff"]} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
      />
      <gridHelper 
        args={[gridSize, gridDivisions, "#ff00ff", "#ff00ff"]} 
        position={[0, 0, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
      />
      <gridHelper 
        args={[gridSize, gridDivisions, "#ffff00", "#ffff00"]} 
        position={[0, 0, 0]} 
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  );
}

// Moving particles in 3D space
function Particles({ count = 200 }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const id = i;
      const x = Math.sin(time * 0.1 + id * 0.1) * 10;
      const y = Math.cos(time * 0.2 + id * 0.3) * 10;
      const z = Math.sin(time * 0.3 + id * 0.5) * 10;

      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      mesh.current.setMatrixAt(id, matrix);
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="cyan" />
    </instancedMesh>
  );
}

// Floating Sphere with neon shader effect
function NeonSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { clock } = useThree();
  
  useFrame(() => {
    const time = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.5 + 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color={new THREE.Color("#00ffff")}
        emissive={new THREE.Color("#00ffff")}
        emissiveIntensity={2}
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// Main effect setup for the scene
function SceneSetup() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color("#000011");
  }, [scene]);
  
  return null;
}

export function ThreeDBackground() {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR rendering for Three.js components
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 2, 15], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Particles />
        <CyberGrid />
        <NeonSphere />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        <SceneSetup />
      </Canvas>
    </div>
  );
}
