import React, { useEffect, useRef } from "react";
import "./ShapeBlur.css";

export default function ShapeBlur({ className = "", variation = 0, pixelRatio = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5 };
    let frame = 0;
    let width = 0;
    let height = 0;

    const shapes = [
      { x: .15, y: .22, radius: .2, speed: .00016, phase: 0, color: "76, 86, 255" },
      { x: .76, y: .24, radius: .23, speed: .00012, phase: 2.2, color: "179, 73, 255" },
      { x: .55, y: .72, radius: .26, speed: .00014, phase: 4.3, color: "255, 77, 36" },
      { x: .9, y: .78, radius: .17, speed: .00019, phase: 5.1, color: "74, 129, 255" }
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, pixelRatio);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
    };

    const render = (time = 0) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      shapes.forEach((shape, index) => {
        const motion = reducedMotion ? 0 : time * shape.speed;
        const x = (shape.x + Math.sin(motion + shape.phase) * .1 + (pointer.x - .5) * (.035 + index * .006)) * width;
        const y = (shape.y + Math.cos(motion * 1.2 + shape.phase) * .085 + (pointer.y - .5) * (.028 + index * .004)) * height;
        const radius = Math.min(width, height) * shape.radius * (1 + Math.sin(motion * 1.7 + shape.phase) * .12);
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${shape.color}, ${variation === 1 ? .25 : .19})`);
        gradient.addColorStop(.38, `rgba(${shape.color}, .12)`);
        gradient.addColorStop(1, `rgba(${shape.color}, 0)`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalCompositeOperation = "source-over";
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };

    resize();
    render();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pixelRatio, variation]);

  return <canvas ref={canvasRef} className={`shape-blur ${className}`.trim()} aria-hidden="true" />;
}
