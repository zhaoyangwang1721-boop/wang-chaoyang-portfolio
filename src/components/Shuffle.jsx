import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./Shuffle.css";

const DEFAULT_CHARSET = "AI增长传播内容电影品牌0123456789";

export default function Shuffle({
  text,
  className = "",
  style = {},
  duration = 0.45,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-40px",
  tag = "p",
  textAlign = "inherit",
  onShuffleComplete,
  shuffleTimes = 2,
  stagger = 0.025,
  scrambleCharset = DEFAULT_CHARSET,
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const characters = useMemo(() => Array.from(String(text ?? "")), [text]);
  const rolls = Math.max(1, Math.floor(shuffleTimes));
  const Tag = tag || "p";

  const play = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = [...root.querySelectorAll(".shuffle-char-track")];
    if (!tracks.length) return;
    timelineRef.current?.kill();
    tracks.forEach((track) => gsap.set(track, { y: 0, color: colorFrom || "inherit" }));
    timelineRef.current = gsap.timeline({ onComplete: onShuffleComplete });
    tracks.forEach((track, index) => {
      const height = track.firstElementChild?.getBoundingClientRect().height || 0;
      timelineRef.current.to(track, {
        y: -height * rolls,
        color: colorTo || "inherit",
        duration,
        ease
      }, Math.min(index * stagger + Math.random() * maxDelay, 0.7));
    });
  }, [colorFrom, colorTo, duration, ease, maxDelay, onShuffleComplete, rolls, stagger]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      root.querySelectorAll(".shuffle-char-track").forEach((track) => {
        const height = track.firstElementChild?.getBoundingClientRect().height || 0;
        gsap.set(track, { y: -height * rolls });
      });
      onShuffleComplete?.();
      return undefined;
    }
    let played = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && (!played || !triggerOnce)) {
        played = true;
        setReady(true);
        requestAnimationFrame(play);
        if (triggerOnce) observer.disconnect();
      }
    }, { threshold, rootMargin });
    observer.observe(root);
    const handleHover = () => { if (triggerOnHover) play(); };
    root.addEventListener("mouseenter", handleHover);
    return () => {
      observer.disconnect();
      root.removeEventListener("mouseenter", handleHover);
      timelineRef.current?.kill();
    };
  }, [onShuffleComplete, play, respectReducedMotion, rolls, rootMargin, threshold, triggerOnce, triggerOnHover]);

  const randomChar = (charIndex, rollIndex) => {
    if (!scrambleCharset) return characters[charIndex];
    return scrambleCharset[(charIndex * 7 + rollIndex * 11) % scrambleCharset.length];
  };

  const characterWidth = (character) => {
    if (/^[\u3000-\u9fff，。、：；！？]$/.test(character)) return "1em";
    if (character === "I" || character === "1") return ".38em";
    if (character === "·") return ".42em";
    if (/^[A-Z0-9+]$/.test(character)) return ".66em";
    return ".62em";
  };

  return (
    <Tag ref={rootRef} className={`shuffle-parent ${ready ? "is-ready" : ""} ${className}`.trim()}
      style={{ textAlign, ...style }}>
      {characters.map((character, charIndex) => character === " " ? " " : (
        <span className="shuffle-char-wrapper" key={`${character}-${charIndex}`} style={{ width: characterWidth(character) }}>
          <span className="shuffle-char-track">
            {Array.from({ length: rolls }, (_, rollIndex) => (
              <span className="shuffle-char" aria-hidden="true" key={rollIndex}>{randomChar(charIndex, rollIndex)}</span>
            ))}
            <span className="shuffle-char">{character}</span>
          </span>
        </span>
      ))}
    </Tag>
  );
}
