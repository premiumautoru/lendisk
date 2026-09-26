"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/** Pointer position in [-1, 1]; read inside the render loop so React never re-renders on mouse move. */
const pointer = { x: 0, y: 0 };

const GOLD = { color: "#b8904f", metalness: 1, roughness: 0.2, envMapIntensity: 1.1 };
const CHROME = { color: "#e9e4da", metalness: 1, roughness: 0.14, envMapIntensity: 1.6 };

/** Y-shaped twin spoke (matches the Lendisk hero wheel), extruded with a soft bevel. */
function useSpokeGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.07, 0.2);
    s.lineTo(-0.06, 0.46);
    s.lineTo(-0.2, 0.9);
    s.quadraticCurveTo(-0.15, 0.93, -0.1, 0.93);
    s.lineTo(-0.012, 0.52);
    s.lineTo(0.012, 0.52);
    s.lineTo(0.1, 0.93);
    s.quadraticCurveTo(0.15, 0.93, 0.2, 0.9);
    s.lineTo(0.06, 0.46);
    s.lineTo(0.07, 0.2);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 12 });
  }, []);
}

function Wheel() {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spoke = useSpokeGeometry();

  const lip = useMemo(() => {
    const pts = [[0.93, -0.3], [0.99, -0.29], [1.02, -0.22], [0.98, -0.18], [0.95, -0.17], [0.95, 0.17], [0.99, 0.2], [1.02, 0.25], [0.97, 0.3]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 128);
  }, []);

  const tyre = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      pts.push(new THREE.Vector2(1.02 + Math.sin(a) * 0.36, -Math.cos(a) * 0.36));
    }
    return new THREE.LatheGeometry(pts, 128);
  }, []);

  const drilled = useMemo(() => {
    // brake disc with drilled holes baked into a small canvas texture
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    grad.addColorStop(0, "#2a2a2e");
    grad.addColorStop(0.7, "#55555c");
    grad.addColorStop(1, "#303035");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#121214";
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r = i % 2 ? 84 : 100;
      g.beginPath();
      g.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 4, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z -= dt * 0.35;
    const k = Math.min(1, dt * 2.2);
    if (tilt.current) {
      tilt.current.rotation.x += (-0.12 + pointer.y * 0.18 - tilt.current.rotation.x) * k;
      tilt.current.rotation.y += (-0.38 + pointer.x * 0.3 - tilt.current.rotation.y) * k;
    }
  });

  return (
    <group ref={tilt} rotation={[-0.12, -0.38, 0]}>
      {/* rotating parts */}
      <group ref={spin}>
        <mesh geometry={tyre} rotation-x={Math.PI / 2}>
          <meshStandardMaterial color="#141416" roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh geometry={lip} rotation-x={Math.PI / 2}>
          <meshStandardMaterial {...CHROME} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position-z={-0.12}>
          <cylinderGeometry args={[0.94, 0.94, 0.34, 96, 1, true]} />
          <meshStandardMaterial color="#1b1b1e" metalness={0.8} roughness={0.5} side={THREE.BackSide} />
        </mesh>
        <mesh position-z={-0.16}>
          <circleGeometry args={[0.72, 96]} />
          <meshStandardMaterial map={drilled} metalness={0.7} roughness={0.45} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} geometry={spoke} rotation-z={(i / 5) * Math.PI * 2} position-z={0.02}>
            <meshStandardMaterial {...GOLD} />
          </mesh>
        ))}
        <mesh rotation-x={Math.PI / 2} position-z={0.08}>
          <cylinderGeometry args={[0.24, 0.26, 0.12, 64]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2 + Math.PI / 5;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.15]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.028, 0.028, 0.05, 6]} />
              <meshStandardMaterial color="#2a2a2e" metalness={0.9} roughness={0.3} />
            </mesh>
          );
        })}
        <mesh rotation-x={Math.PI / 2} position-z={0.15}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 48]} />
          <meshStandardMaterial color="#0e0e10" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>

      {/* static caliper, like on a real car */}
      <mesh position={[0.43, 0.43, -0.06]} rotation-z={-Math.PI / 4}>
        <boxGeometry args={[0.2, 0.46, 0.14]} />
        <meshStandardMaterial color="#b8904f" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Podium() {
  return (
    <group position={[0, -1.52, 0]}>
      <mesh>
        <cylinderGeometry args={[1.35, 1.45, 0.22, 96]} />
        <meshStandardMaterial color="#141416" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position-y={0.115} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[1.05, 0.018, 16, 128]} />
        <meshBasicMaterial color="#fff6e6" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.4, 0.4]} intensity={2.5} distance={3} color="#ffe9c4" />
    </group>
  );
}

/** Pauses the render loop when the hero is off-screen or the tab is hidden. */
function useVisible(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return visible;
}

export default function Hero3DScene({ onReady }: { onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useVisible(wrap);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.1, 6.6], fov: 32 }}
        onCreated={() => onReady?.()}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 4, 5]} intensity={0.9} color="#fff3dc" />
        <directionalLight position={[-4, 1, -2]} intensity={1.2} color="#c29a5a" />
        <group position={[0, 0.25, 0]}>
          <Wheel />
        </group>
        <Podium />
        <ContactShadows position={[0, -1.4, 0]} opacity={0.6} scale={5} blur={2.6} far={2} />
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 5, 2]} scale={[10, 1.2, 1]} />
          <Lightformer intensity={2} color="#ffe2b0" position={[-5, 1, 3]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer intensity={1.6} position={[5, 0, 3]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer intensity={0.5} position={[0, 0, 6]} scale={[3, 3, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
