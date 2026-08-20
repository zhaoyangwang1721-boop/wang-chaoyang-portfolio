import { useEffect, useRef, useState } from "react";
import "./ParticleText.css";

export default function ParticleText({
  text = "brilliant.",
  colors = ["#ffffff"],
  particleSize = 2,
  particleGap = 3,
  mouseControls = { enabled: true, radius: 150, strength: 5 },
  fontSize = 180,
  autoFit = true,
  lineScales = [1],
  letterSpacing = [0],
  lineGap = 0.12,
  backgroundColor = "transparent",
  friction = 0.75,
  ease = 0.05,
  className = ""
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const colorKey = colors.join("|");
  const mouseEnabled = mouseControls.enabled ?? true;
  const mouseRadius = mouseControls.radius ?? 150;
  const mouseStrength = mouseControls.strength ?? 5;
  const lineScaleKey = lineScales.join("|");
  const letterSpacingKey = letterSpacing.join("|");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -10000, y: -10000, active: false };
    let particles = [];
    let frame = 0;
    let visible = true;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const createParticles = () => {
      dpr = Math.min(1.6, window.devicePixelRatio || 1);
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = Math.round(width);
      sampleCanvas.height = Math.round(height);
      const sample = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sample) return;

      const lines = String(text).split("\n");
      const horizontalPadding = Math.max(18, width * 0.035);
      const verticalPadding = Math.max(10, height * 0.06);
      const fontFamily = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
      const scales = lines.map((_, index) => lineScales[index] ?? lineScales.at(-1) ?? 1);
      const spacing = lines.map((_, index) => letterSpacing[index] ?? letterSpacing.at(-1) ?? 0);
      const lineHeightRatio = 0.9;
      const heightUnits = scales.reduce((sum, scale) => sum + scale * lineHeightRatio, 0) + Math.max(0, lines.length - 1) * lineGap;
      let fittedSize = Math.min(fontSize, (height - verticalPadding * 2) / Math.max(heightUnits, 0.1));
      const measureLine = (line, size, spacingEm, weight) => {
        sample.font = `${weight} ${size}px ${fontFamily}`;
        const characterSpacing = size * spacingEm;
        return [...line].reduce((sum, character, index) => (
          sum + sample.measureText(character).width + (index < line.length - 1 ? characterSpacing : 0)
        ), 0);
      };
      if (autoFit) {
        const longest = Math.max(...lines.map((line, index) => {
          const size = fittedSize * scales[index];
          return measureLine(line, size, spacing[index], index === 0 ? 430 : 560);
        }), 1);
        fittedSize *= Math.min(1, (width - horizontalPadding * 2) / longest);
      }
      const lineHeights = scales.map((scale) => fittedSize * scale * lineHeightRatio);
      const lineGapPixels = fittedSize * lineGap;
      const totalHeight = lineHeights.reduce((sum, value) => sum + value, 0) + lineGapPixels * Math.max(0, lines.length - 1);
      let lineTop = (height - totalHeight) / 2;

      sample.clearRect(0, 0, width, height);
      sample.fillStyle = "#fff";
      sample.textAlign = "left";
      sample.textBaseline = "alphabetic";
      lines.forEach((line, index) => {
        const weight = index === 0 ? 430 : 560;
        const size = fittedSize * scales[index];
        const characterSpacing = size * spacing[index];
        const lineWidth = measureLine(line, size, spacing[index], weight);
        let cursorX = (width - lineWidth) / 2;
        const baselineY = lineTop + size * 0.78;
        sample.font = `${weight} ${size}px ${fontFamily}`;
        [...line].forEach((character, characterIndex) => {
          sample.fillText(character, cursorX, baselineY);
          cursorX += sample.measureText(character).width;
          if (characterIndex < line.length - 1) cursorX += characterSpacing;
        });
        lineTop += lineHeights[index] + lineGapPixels;
      });

      const pixels = sample.getImageData(0, 0, width, height).data;
      const gap = Math.max(2, Math.round(particleGap));
      const nextParticles = [];
      for (let y = verticalPadding; y < height - verticalPadding; y += gap) {
        for (let x = horizontalPadding; x < width - horizontalPadding; x += gap) {
          if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 100) {
            const color = colors[(x + y + nextParticles.length) % colors.length] || "#fff";
            nextParticles.push({
              x: x + (Math.random() - 0.5) * width * 0.08,
              y: y + (Math.random() - 0.5) * height * 0.2,
              homeX: x,
              homeY: y,
              velocityX: 0,
              velocityY: 0,
              color,
              size: particleSize * (0.72 + Math.random() * 0.65)
            });
          }
        }
      }
      particles = nextParticles;
      setReady(true);
    };

    const draw = () => {
      if (!visible) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      if (backgroundColor !== "transparent") {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
      }
      const radius = mouseRadius;
      const strength = mouseStrength;
      particles.forEach((particle) => {
        if (!reducedMotion.matches) {
          if (mouseEnabled && pointer.active) {
            const deltaX = particle.x - pointer.x;
            const deltaY = particle.y - pointer.y;
            const distance = Math.max(1, Math.hypot(deltaX, deltaY));
            if (distance < radius) {
              const force = (1 - distance / radius) * strength;
              particle.velocityX += (deltaX / distance) * force;
              particle.velocityY += (deltaY / distance) * force;
            }
          }
          particle.velocityX += (particle.homeX - particle.x) * ease;
          particle.velocityY += (particle.homeY - particle.y) * ease;
          particle.velocityX *= friction;
          particle.velocityY *= friction;
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
        } else {
          particle.x = particle.homeX;
          particle.y = particle.homeY;
        }
        context.fillStyle = particle.color;
        context.globalAlpha = 0.76 + Math.random() * 0.24;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      draw();
    };
    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };
    const handlePointerLeave = () => { pointer.active = false; };
    const resizeObserver = new ResizeObserver(() => {
      createParticles();
      start();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    }, { threshold: 0.02 });

    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    createParticles();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, [autoFit, backgroundColor, colorKey, ease, fontSize, friction, letterSpacingKey, lineGap, lineScaleKey, mouseEnabled, mouseRadius, mouseStrength, particleGap, particleSize, text]);

  return (
    <div className={`particle-text ${className}`.trim()} ref={containerRef}>
      <canvas aria-hidden="true" ref={canvasRef} />
      <h1 className={ready ? "particle-text__semantic" : "particle-text__fallback"}>
        {String(text).split("\n").map((line, index) => (
          <span
            key={`${line}-${index}`}
            style={{
              fontSize: `${lineScales[index] ?? lineScales.at(-1) ?? 1}em`,
              letterSpacing: `${letterSpacing[index] ?? letterSpacing.at(-1) ?? 0}em`
            }}
          >
            {line}
          </span>
        ))}
      </h1>
    </div>
  );
}
