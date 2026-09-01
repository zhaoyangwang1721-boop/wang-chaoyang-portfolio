/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { easing } from "maath";
import { useEffect, useRef, useState } from "react";
import "./FluidGlass.css";

const DEFAULT_MATERIAL = {
  ior: 1.15,
  thickness: 2,
  transmission: 1,
  roughness: 0,
  chromaticAberration: 0.05,
  anisotropy: 0.01
};

function Lens({ scale = 0.72, materialProps }) {
  const lensRef = useRef();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event) => {
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 3.2;
      target.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    if (!lensRef.current) return;
    easing.damp3(lensRef.current.position, [target.current.x, target.current.y, 0], 0.22, delta);
    lensRef.current.rotation.z += delta * 0.045;
  });

  return (
    <mesh ref={lensRef} scale={scale} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[1.35, 1.35, 0.28, 64]} />
      <MeshTransmissionMaterial
        color="#eef6ff"
        attenuationColor="#5d71ff"
        attenuationDistance={1.2}
        clearcoat={1}
        clearcoatRoughness={0}
        samples={6}
        resolution={256}
        {...materialProps}
      />
    </mesh>
  );
}

export default function FluidGlass({
  mode = "lens",
  className = "",
  lensProps = {},
  scale,
  ior,
  thickness,
  transmission,
  roughness,
  chromaticAberration,
  anisotropy
}) {
  const rootRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting && !document.hidden));
    const handleVisibilityChange = () => {
      const rect = root.getBoundingClientRect();
      setIsVisible(!document.hidden && rect.bottom > 0 && rect.top < window.innerHeight);
    };
    observer.observe(root);
    window.addEventListener("scroll", handleVisibilityChange, { passive: true });
    window.addEventListener("resize", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleVisibilityChange);
      window.removeEventListener("resize", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section) return undefined;
    const handlePointerMove = (event) => {
      const rect = section.getBoundingClientRect();
      root.style.setProperty("--glass-x", `${event.clientX - rect.left}px`);
      root.style.setProperty("--glass-y", `${event.clientY - rect.top}px`);
    };
    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => section.removeEventListener("pointermove", handlePointerMove);
  }, []);
  const mergedProps = {
    ...DEFAULT_MATERIAL,
    ...lensProps,
    ...(scale == null ? {} : { scale }),
    ...(ior == null ? {} : { ior }),
    ...(thickness == null ? {} : { thickness }),
    ...(transmission == null ? {} : { transmission }),
    ...(roughness == null ? {} : { roughness }),
    ...(chromaticAberration == null ? {} : { chromaticAberration }),
    ...(anisotropy == null ? {} : { anisotropy })
  };
  const { scale: lensScale, ...materialProps } = mergedProps;

  if (mode !== "lens") return null;

  return (
    <div ref={rootRef} className={`fluid-glass-layer ${className}`.trim()} aria-hidden="true">
      <div className="fluid-glass-dom-lens" />
      {isVisible ? (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 32 }}
          dpr={[1, 1.35]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.4} />
          <Environment resolution={96}>
            <Lightformer form="ring" color="#ffffff" intensity={4} scale={3} position={[0, 1, 4]} />
            <Lightformer form="rect" color="#7f8cff" intensity={3} scale={[5, 1, 1]} position={[-3, -1, 2]} />
            <Lightformer form="rect" color="#ff6d91" intensity={2} scale={[4, 1, 1]} position={[3, 2, 1]} />
          </Environment>
          <Lens scale={lensScale} materialProps={materialProps} />
        </Canvas>
      ) : null}
    </div>
  );
}
