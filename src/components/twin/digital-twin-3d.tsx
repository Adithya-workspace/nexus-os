"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { DepartmentScore } from "@/lib/simulation/types";

const NODE_LAYOUT: Record<string, [number, number, number]> = {
  finance: [2.4, 1.2, 0],
  inventory: [-2.4, 1.2, 0.5],
  sales: [2.4, -1.2, -0.5],
  marketing: [-2.4, -1.2, 0],
  customers: [0, 2.4, 0.5],
  operations: [0, -2.4, -0.5],
  hr: [0, 0, 2.6],
};

const CONNECTIONS: [string, string][] = [
  ["finance", "sales"],
  ["finance", "inventory"],
  ["sales", "marketing"],
  ["sales", "customers"],
  ["marketing", "customers"],
  ["inventory", "operations"],
  ["operations", "hr"],
  ["customers", "hr"],
  ["finance", "operations"],
  ["inventory", "marketing"],
];

function scoreColor(score: number): string {
  if (score >= 65) return "#34d399";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

function DepartmentNode({ dept, position }: { dept: DepartmentScore; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = 0.35 + (dept.score / 100) * 0.35;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.08;
    meshRef.current.rotation.y += 0.003;
  });

  const color = scoreColor(dept.score);

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[scale, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.25} metalness={0.4} />
      </mesh>
      <Html position={[0, -scale - 0.55, 0]} center distanceFactor={8} occlude={false}>
        <div className="flex flex-col items-center pointer-events-none select-none whitespace-nowrap">
          <span className="text-[13px] font-medium text-gray-200">{dept.label}</span>
          <span className="text-[11px] font-semibold" style={{ color }}>
            {Math.round(dept.score)}
          </span>
        </div>
      </Html>
    </group>
  );
}

function ConnectionLines({ departments }: { departments: DepartmentScore[] }) {
  const lines = useMemo(() => {
    return CONNECTIONS.map(([a, b]) => {
      const posA = NODE_LAYOUT[a];
      const posB = NODE_LAYOUT[b];
      if (!posA || !posB) return null;
      const deptA = departments.find((d) => d.id === a);
      const avgScore = deptA ? deptA.score : 50;
      return { key: `${a}-${b}`, points: [posA, posB] as [number, number, number][], color: scoreColor(avgScore) };
    }).filter(Boolean) as { key: string; points: [number, number, number][]; color: string }[];
  }, [departments]);

  return (
    <>
      {lines.map((line) => (
        <Line key={line.key} points={line.points} color={line.color} lineWidth={1} transparent opacity={0.35} />
      ))}
    </>
  );
}

function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.002;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.9} roughness={0.1} metalness={0.6} transparent opacity={0.85} />
    </mesh>
  );
}

export function DigitalTwin3D({ departments, interactive = true }: { departments: DepartmentScore[]; interactive?: boolean }) {
  return (
    <div className="h-full w-full">
      <Canvas flat camera={{ position: [0, 1.5, 8], fov: 50 }}>
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#a78bfa" />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#22d3ee" />
        <CoreOrb />
        <ConnectionLines departments={departments} />
        {departments.map((dept) => {
          const position = NODE_LAYOUT[dept.id];
          if (!position) return null;
          return <DepartmentNode key={dept.id} dept={dept} position={position} />;
        })}
        {interactive && (
          <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.6} minDistance={4} maxDistance={14} />
        )}
      </Canvas>
    </div>
  );
}