import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import "./ShinyText.css";

export default function ShinyText({ text, disabled = false, speed = 3.4, className = "", color = "#e6e1da", shineColor = "#ffffff", spread = 118, yoyo = false, pauseOnHover = false, direction = "left", delay = 0.8 }) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const directionRef = useRef(direction === "left" ? 1 : -1);
  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time) => {
    if (disabled || isPaused) { lastTimeRef.current = null; return; }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;
    const cycleDuration = animationDuration + delayDuration;
    const cycleTime = elapsedRef.current % (yoyo ? cycleDuration * 2 : cycleDuration);
    let value;
    if (!yoyo) value = cycleTime < animationDuration ? (cycleTime / animationDuration) * 100 : 100;
    else if (cycleTime < animationDuration) value = (cycleTime / animationDuration) * 100;
    else if (cycleTime < cycleDuration) value = 100;
    else if (cycleTime < cycleDuration + animationDuration) value = 100 - ((cycleTime - cycleDuration) / animationDuration) * 100;
    else value = 0;
    progress.set(directionRef.current === 1 ? value : 100 - value);
  });

  useEffect(() => {
    directionRef.current = direction === "left" ? 1 : -1;
    elapsedRef.current = 0;
    progress.set(0);
  }, [direction, progress]);

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`);
  const handleMouseEnter = useCallback(() => pauseOnHover && setIsPaused(true), [pauseOnHover]);
  const handleMouseLeave = useCallback(() => pauseOnHover && setIsPaused(false), [pauseOnHover]);

  return (
    <motion.span className={`shiny-text ${className}`.trim()} style={{ backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`, backgroundSize: "200% auto", backgroundPosition, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {text}
    </motion.span>
  );
}
