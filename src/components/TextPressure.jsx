import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./TextPressure.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getCharacterUnits = (character) => {
  if (character === " ") return 0.35;
  if (/[\u2e80-\u9fff\uf900-\ufaff]/u.test(character)) return 1;
  return 0.62;
};

export default function TextPressure({
  text = "Compressa",
  as: Component = "span",
  fontFamily = '"Roboto Flex", "Noto Sans SC", sans-serif',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  autoSize = true,
  wrap = false,
  textColor = "#ffffff",
  strokeColor = "#ff0000",
  className = "",
  minFontSize = 24
}) {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const charactersRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const easedPointerRef = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const characters = useMemo(() => Array.from(text), [text]);

  const updateSize = useCallback(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    if (!container || !title) return;

    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const characterUnits = characters.reduce((total, character) => total + getCharacterUnits(character), 0) || 1;
    const widthSize = (containerWidth / characterUnits) * 0.94;
    const heightSize = containerHeight * 0.9;
    const safeMinimum = Math.min(minFontSize, heightSize);
    const nextFontSize = Math.max(safeMinimum, Math.min(widthSize, heightSize));

    setFontSize(nextFontSize);
    setScaleY(1);

    if (scale) {
      requestAnimationFrame(() => {
        const titleHeight = title.getBoundingClientRect().height;
        if (titleHeight > 0) setScaleY(containerHeight / titleHeight);
      });
    }
  }, [characters, minFontSize, scale]);

  useEffect(() => {
    if (!autoSize) return undefined;
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoSize, updateSize]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setPointer = (x, y) => {
      pointerRef.current = { x, y };
    };
    const handlePointerMove = (event) => setPointer(event.clientX, event.clientY);
    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) setPointer(touch.clientX, touch.clientY);
    };

    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setPointer(rect.left + rect.width / 2, rect.top + rect.height / 2);
      easedPointerRef.current = pointerRef.current;
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let animationFrame;
    const animate = () => {
      const eased = easedPointerRef.current;
      const pointer = pointerRef.current;
      eased.x += (pointer.x - eased.x) / 15;
      eased.y += (pointer.y - eased.y) / 15;

      const title = titleRef.current;
      if (title && !reducedMotion.matches) {
        const titleRect = title.getBoundingClientRect();
        const maxDistance = Math.max(titleRect.width * 0.56, 1);

        charactersRef.current.forEach((character) => {
          if (!character) return;
          const rect = character.getBoundingClientRect();
          const distance = Math.hypot(
            eased.x - (rect.left + rect.width / 2),
            eased.y - (rect.top + rect.height / 2)
          );
          const influence = clamp(1 - distance / maxDistance, 0, 1);
          const widthValue = width ? Math.round(78 + influence * 73) : 100;
          const weightValue = weight ? Math.round(320 + influence * 580) : 500;
          const italicValue = italic ? influence : 0;
          const alphaValue = alpha ? 0.35 + influence * 0.65 : 1;
          const horizontalScale = width ? 0.9 + influence * 0.18 : 1;
          const skew = italic ? -italicValue * 4 : 0;

          character.style.fontVariationSettings = `'wght' ${weightValue}, 'wdth' ${widthValue}`;
          character.style.opacity = String(alphaValue);
          character.style.transform = `scaleX(${horizontalScale}) skewX(${skew}deg)`;
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [alpha, italic, weight, width]);

  const dynamicClassName = [
    "text-pressure-title",
    flex ? "is-flex" : "",
    stroke ? "has-stroke" : "",
    wrap ? "is-wrapping" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <span ref={containerRef} className="text-pressure">
      <Component
        ref={titleRef}
        className={dynamicClassName}
        aria-label={text}
        style={{
          "--text-pressure-color": textColor,
          "--text-pressure-stroke": strokeColor,
          fontFamily,
          fontSize: autoSize ? fontSize : undefined,
          lineHeight: scale ? scaleY : 0.94,
          transform: `scaleY(${scaleY})`
        }}
      >
        {characters.map((character, index) => (
          <span
            aria-hidden="true"
            data-char={character}
            key={`${character}-${index}`}
            ref={(element) => {
              charactersRef.current[index] = element;
            }}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </Component>
    </span>
  );
}
