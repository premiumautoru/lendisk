"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/** GLB/GLTF viewer: drag to orbit, pinch/scroll to zoom. Loaded lazily only when a model exists. */
export default function ModelViewer({ url }: { url: string }) {
  return (
    <div className="absolute inset-0 touch-none">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Model url={url} />
          </Bounds>
          {/* local studio lighting (no external HDR download) */}
          <Environment resolution={256}>
            <Lightformer intensity={2} position={[0, 3, 2]} scale={[6, 1, 1]} />
            <Lightformer intensity={1.2} position={[-4, 0, 1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
            <Lightformer intensity={1.2} color="#e3c894" position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
          </Environment>
          <ContactShadows position={[0, -0.9, 0]} opacity={0.4} blur={2.5} scale={6} />
        </Suspense>
        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={1.2} minDistance={1} maxDistance={8} />
      </Canvas>
    </div>
  );
}
