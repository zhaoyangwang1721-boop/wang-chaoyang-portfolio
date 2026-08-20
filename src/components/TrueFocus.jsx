import { useEffect, useRef, useState } from "react";
import "./TrueFocus.css";

export default function TrueFocus({
  sentence = "True Focus",
  segments,
  manualMode = false,
  blurAmount = 2,
  borderColor = "#ff5a2a",
  glowColor = "rgba(255, 90, 42, .34)",
  animationDuration = 0.55,
  pauseBetweenAnimations = 1.15,
  as: Tag = "h2",
  className = ""
}) {
  const words = segments?.length ? segments : sentence.split(/\s+/).filter(Boolean);
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [frame, setFrame] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  useEffect(() => {
    if (manualMode || words.length < 2) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000
    );
    return () => window.clearInterval(timer);
  }, [animationDuration, manualMode, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    const root = rootRef.current;
    const active = itemRefs.current[activeIndex];
    if (!root || !active) return undefined;

    const updateFrame = () => {
      const rootRect = root.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      setFrame({
        left: activeRect.left - rootRect.left,
        top: activeRect.top - rootRect.top,
        width: activeRect.width,
        height: activeRect.height,
        ready: true
      });
    };

    updateFrame();
    document.fonts?.ready?.then(updateFrame);
    const observer = new ResizeObserver(updateFrame);
    observer.observe(root);
    observer.observe(active);
    return () => observer.disconnect();
  }, [activeIndex]);

  const label = words.join("");

  return (
    <Tag
      ref={rootRef}
      className={`true-focus ${className}`.trim()}
      aria-label={label}
      style={{
        "--true-focus-blur": `${blurAmount}px`,
        "--true-focus-border": borderColor,
        "--true-focus-glow": glowColor,
        "--true-focus-duration": `${animationDuration}s`
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          ref={(node) => { itemRefs.current[index] = node; }}
          className={`true-focus__segment${index === activeIndex ? " is-active" : ""}`}
          aria-hidden="true"
          onPointerEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
        >
          {word}
        </span>
      ))}
      <span
        className={`true-focus__frame${frame.ready ? " is-ready" : ""}`}
        aria-hidden="true"
        style={{ transform: `translate3d(${frame.left}px, ${frame.top}px, 0)`, width: frame.width, height: frame.height }}
      >
        <i /><i /><i /><i />
      </span>
    </Tag>
  );
}
