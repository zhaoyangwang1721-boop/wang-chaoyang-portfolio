import React, { useEffect, useRef } from "react";
import "./BorderGlow.css";

export default function BorderGlow({
  as: Component = "div",
  children,
  className = "",
  edgeSensitivity = 42,
  glowColor = "40 80 80",
  backgroundColor = "#050508",
  borderRadius = 20,
  glowRadius = 50,
  glowIntensity = 1.35,
  coneSpread = 30,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const updateGlow = (event) => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--border-glow-x", `${event.clientX - rect.left}px`);
      node.style.setProperty("--border-glow-y", `${event.clientY - rect.top}px`);
      node.style.setProperty("--border-glow-opacity", "1");
    };
    const hideGlow = () => node.style.setProperty("--border-glow-opacity", ".46");

    node.addEventListener("pointermove", updateGlow);
    node.addEventListener("pointerleave", hideGlow);
    return () => {
      node.removeEventListener("pointermove", updateGlow);
      node.removeEventListener("pointerleave", hideGlow);
    };
  }, []);

  return (
    <Component
      ref={ref}
      className={`border-glow ${animated ? "border-glow--animated" : ""} ${className}`.trim()}
      style={{
        "--border-glow-edge": `${edgeSensitivity}px`,
        "--border-glow-color": glowColor,
        "--border-glow-bg": backgroundColor,
        "--border-glow-radius": `${borderRadius}px`,
        "--border-glow-size": `${glowRadius}px`,
        "--border-glow-intensity": glowIntensity,
        "--border-glow-cone": `${coneSpread}%`,
        "--border-glow-a": colors[0],
        "--border-glow-b": colors[1] || colors[0],
        "--border-glow-c": colors[2] || colors[0]
      }}
      {...props}
    >
      <div className="border-glow__edge" aria-hidden="true" />
      <div className="border-glow__content">{children}</div>
    </Component>
  );
}
