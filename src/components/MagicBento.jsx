import { useRef } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

export function MagicBentoFrame({ as: Component = "article", children, className = "", glowColor = "154, 131, 255", ...props }) {
  const frameRef = useRef(null);
  const handleMove = (event) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    frame.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    frame.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(frame, { rotateX: ((y / rect.height) - .5) * -2.4, rotateY: ((x / rect.width) - .5) * 2.4, duration: .3, ease: "power2.out" });
  };
  const reset = () => frameRef.current && gsap.to(frameRef.current, { rotateX: 0, rotateY: 0, duration: .45, ease: "power2.out" });
  return (
    <Component ref={frameRef} className={`magic-bento-frame ${className}`.trim()} style={{ "--bento-glow": glowColor }} onPointerMove={handleMove} onPointerLeave={reset} {...props}>
      {children}
      <i className="magic-bento-frame__spark" aria-hidden="true" />
    </Component>
  );
}

export default function MagicBento({
  items = [],
  glowColor = "255, 93, 55",
  enableTilt = true,
  enableMagnetism = true,
  activeIndex = 0,
  onSelect,
  variant = "grid"
}) {
  const cardsRef = useRef([]);
  const handleMove = (event, index) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(card, {
      rotateX: enableTilt ? ((y / rect.height) - 0.5) * -5 : 0,
      rotateY: enableTilt ? ((x / rect.width) - 0.5) * 5 : 0,
      x: enableMagnetism ? (x - rect.width / 2) * 0.018 : 0,
      y: enableMagnetism ? (y - rect.height / 2) * 0.018 : 0,
      duration: 0.28,
      ease: "power2.out"
    });
  };
  const reset = (index) => {
    const card = cardsRef.current[index];
    if (card) gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.42, ease: "power2.out" });
  };
  return (
    <div className={`magic-bento-grid magic-bento-${variant}`} style={{ "--bento-glow": glowColor }}>
      {items.map((item, index) => (
        <article ref={(node) => { cardsRef.current[index] = node; }}
          className={`magic-bento-card ${activeIndex === index ? "is-active" : ""}`} key={item.company}
          onPointerMove={(event) => handleMove(event, index)} onPointerLeave={() => reset(index)}
          onClick={() => onSelect?.(index)} tabIndex={onSelect ? 0 : undefined}
          onKeyDown={(event) => {
            if (onSelect && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              onSelect(index);
            }
          }}
          aria-current={activeIndex === index ? "true" : undefined} data-reveal>
          <span className="magic-bento-card__index">{String(index + 1).padStart(2, "0")}</span>
          <div className="magic-bento-card__content"><h3>{item.company}</h3><strong>{item.role}</strong><p>{item.detail}</p></div>
          {Array.from({ length: 6 }, (_, starIndex) => <i className="magic-bento-star" aria-hidden="true" key={starIndex}
            style={{ left: `${12 + ((starIndex * 17) % 74)}%`, top: `${16 + ((starIndex * 23) % 68)}%`, transitionDelay: `${starIndex * 35}ms` }} />)}
        </article>
      ))}
    </div>
  );
}
