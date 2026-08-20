import { useEffect, useMemo, useState } from "react";
import "./SplitFlapText.css";

const randomChar = (charset) => charset[Math.floor(Math.random() * charset.length)] || " ";

export default function SplitFlapText({ text = "", charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", flipsPerChar = 5, stagger = 0.055, flipDuration = 0.12, tileColor = "#17171d", textColor = "#f8fafc", tileRadius = 8, gap = 6, fontSize = 52, padTo = 0, className = "", style = {} }) {
  const target = useMemo(() => String(text).padEnd(Math.max(Number(padTo) || 0, String(text).length), " "), [padTo, text]);
  const [characters, setCharacters] = useState(() => Array.from(target, () => " "));
  const [flipping, setFlipping] = useState(() => Array.from(target, () => false));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharacters(Array.from(target));
      return undefined;
    }
    const timers = [];
    Array.from(target).forEach((character, index) => {
      for (let step = 0; step <= flipsPerChar; step += 1) {
        timers.push(window.setTimeout(() => {
          setCharacters((current) => current.map((value, itemIndex) => itemIndex === index ? (step === flipsPerChar ? character : randomChar(charset)) : value));
          setFlipping((current) => current.map((value, itemIndex) => itemIndex === index ? step < flipsPerChar : value));
        }, (index * stagger + step * flipDuration) * 1000));
      }
    });
    return () => timers.forEach(window.clearTimeout);
  }, [charset, flipDuration, flipsPerChar, stagger, target]);

  return (
    <span className={`split-flap-text ${className}`.trim()} aria-label={text} style={{ "--split-flap-tile-color": tileColor, "--split-flap-text-color": textColor, "--split-flap-radius": typeof tileRadius === "number" ? `${tileRadius}px` : tileRadius, "--split-flap-gap": typeof gap === "number" ? `${gap}px` : gap, "--split-flap-font-size": typeof fontSize === "number" ? `${fontSize}px` : fontSize, "--split-flap-flip-duration": `${flipDuration}s`, ...style }}>
      {characters.map((character, index) => <span className={`split-flap-text__tile${flipping[index] ? " is-flipping" : ""}`} aria-hidden="true" key={index}><span>{character === " " ? "\u00a0" : character}</span></span>)}
    </span>
  );
}
