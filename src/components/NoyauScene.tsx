import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Pokeball({ onTap }: { onTap: () => void }) {
  const group = useRef<THREE.Group>(null);
  const press = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.35;
    press.current = THREE.MathUtils.lerp(press.current, 0, Math.min(1, dt * 7));
    g.scale.setScalar(1 - press.current * 0.12);
  });

  const handleTap = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    press.current = 1;
    onTap();
  };

  return (
    <group ref={group} onPointerDown={handleTap}>
      <mesh>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e8473f" emissive="#3a0d0a" emissiveIntensity={0.4} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#eef2f0" emissive="#0a1410" emissiveIntensity={0.3} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.015, 1.015, 0.13, 48, 1, true]} />
        <meshStandardMaterial color="#0c0f0e" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
        <meshStandardMaterial color="#d7f5e6" emissive="#1d9e75" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function NoyauScene({ onTap }: { onTap: () => void }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.4], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#1d9e75" />
      <Pokeball onTap={onTap} />
    </Canvas>
  );
}
