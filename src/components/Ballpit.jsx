import { useEffect, useRef } from "react";
import "./Ballpit.css";

const DEFAULT_COLORS = ["#f5f7ff", "#9caed2", "#ff6b45", "#65729b", "#9a85c7"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function hexToRgb(color) {
  const value = color.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;
  const number = Number.parseInt(normalized, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

export default function Ballpit({
  count = 72,
  gravity = 0.035,
  friction = 0.995,
  wallBounce = 0.82,
  followCursor = true,
  colors = DEFAULT_COLORS,
  minRadius = 12,
  maxRadius = 42,
  className = ""
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const pointer = { x: 0, y: 0, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let visible = true;
    let balls = [];

    const makeBall = (index) => {
      const depth = 0.52 + Math.random() * 0.9;
      const radius = (minRadius + Math.random() * (maxRadius - minRadius)) * depth;
      return {
        x: Math.random() * Math.max(1, width),
        y: Math.random() * Math.max(1, height * 0.86),
        vx: (Math.random() - 0.5) * 0.72,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
        depth,
        color: colors[index % colors.length],
        phase: Math.random() * Math.PI * 2
      };
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (!balls.length) balls = Array.from({ length: count }, (_, index) => makeBall(index));
      balls.forEach((ball) => {
        ball.x = clamp(ball.x, ball.radius, width - ball.radius);
        ball.y = clamp(ball.y, ball.radius, height - ball.radius);
      });
    };

    const drawBall = (ball) => {
      const { r, g, b } = hexToRgb(ball.color);
      const gradient = context.createRadialGradient(
        ball.x - ball.radius * 0.32,
        ball.y - ball.radius * 0.38,
        ball.radius * 0.04,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, `rgba(255,255,255,${0.9 * ball.depth})`);
      gradient.addColorStop(0.18, `rgba(${r},${g},${b},.96)`);
      gradient.addColorStop(0.72, `rgba(${Math.round(r * 0.62)},${Math.round(g * 0.62)},${Math.round(b * 0.62)},.94)`);
      gradient.addColorStop(1, `rgba(${Math.round(r * 0.22)},${Math.round(g * 0.22)},${Math.round(b * 0.22)},.9)`);
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.shadowColor = `rgba(${r},${g},${b},.24)`;
      context.shadowBlur = ball.radius * 0.55;
      context.fill();
      context.shadowBlur = 0;
    };

    const resolveCollisions = () => {
      for (let firstIndex = 0; firstIndex < balls.length; firstIndex += 1) {
        const first = balls[firstIndex];
        for (let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1) {
          const second = balls[secondIndex];
          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const minimumDistance = first.radius + second.radius;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared <= 0 || distanceSquared >= minimumDistance * minimumDistance) continue;

          const distance = Math.sqrt(distanceSquared);
          const normalX = dx / distance;
          const normalY = dy / distance;
          const overlap = (minimumDistance - distance) * 0.5;
          first.x -= normalX * overlap;
          first.y -= normalY * overlap;
          second.x += normalX * overlap;
          second.y += normalY * overlap;

          const relativeVelocity = (second.vx - first.vx) * normalX + (second.vy - first.vy) * normalY;
          if (relativeVelocity < 0) {
            const impulse = relativeVelocity * 0.58;
            first.vx += impulse * normalX;
            first.vy += impulse * normalY;
            second.vx -= impulse * normalX;
            second.vy -= impulse * normalY;
          }
        }
      }
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      if (!reducedMotion.matches) {
        balls.forEach((ball) => {
          ball.vy += gravity * ball.depth;
          ball.vx *= friction;
          ball.vy *= friction;
          ball.vx += Math.sin(time * 0.00045 + ball.phase) * 0.0025;

          if (followCursor && pointer.active) {
            const dx = ball.x - pointer.x;
            const dy = ball.y - pointer.y;
            const distanceSquared = dx * dx + dy * dy;
            const influence = Math.max(120, ball.radius * 4.5);
            if (distanceSquared > 1 && distanceSquared < influence * influence) {
              const distance = Math.sqrt(distanceSquared);
              const force = (1 - distance / influence) * 0.85;
              ball.vx += (dx / distance) * force;
              ball.vy += (dy / distance) * force;
            }
          }

          ball.x += ball.vx;
          ball.y += ball.vy;
          if (ball.x < ball.radius) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * wallBounce;
          } else if (ball.x > width - ball.radius) {
            ball.x = width - ball.radius;
            ball.vx = -Math.abs(ball.vx) * wallBounce;
          }
          if (ball.y < ball.radius) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy) * wallBounce;
          } else if (ball.y > height - ball.radius) {
            ball.y = height - ball.radius;
            ball.vy = -Math.abs(ball.vy) * wallBounce;
          }
        });
        resolveCollisions();
      }

      balls.slice().sort((a, b) => a.depth - b.depth).forEach(drawBall);
      if (visible && !reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };
    const handlePointerLeave = () => { pointer.active = false; };
    const handleMotionChange = () => {
      cancelAnimationFrame(frame);
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) draw();
    }, { rootMargin: "160px" });

    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    reducedMotion.addEventListener("change", handleMotionChange);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, [colors, count, followCursor, friction, gravity, maxRadius, minRadius, wallBounce]);

  return (
    <div className={`ballpit ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
