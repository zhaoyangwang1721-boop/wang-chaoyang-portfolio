import { useEffect, useRef, useState } from "react";
import "./RotatingText.css";

export default function RotatingText({
  texts,
  rotationInterval = 2200,
  className = "",
  staggerDuration = 0.035
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting && !document.hidden));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (texts.length < 2 || !isVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % texts.length),
      rotationInterval
    );
    return () => window.clearInterval(timer);
  }, [isVisible, rotationInterval, texts.length]);

  return (
    <span ref={rootRef} className={`rotating-text ${className}`.trim()} aria-hidden="true">
      <span className="rotating-text__word" key={activeIndex}>
        {[...texts[activeIndex]].map((character, index) => (
          <span key={`${character}-${index}`} style={{ animationDelay: `${index * staggerDuration}s` }}>{character}</span>
        ))}
      </span>
    </span>
  );
}
