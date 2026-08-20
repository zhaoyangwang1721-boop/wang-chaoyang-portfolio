import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "./SpecularButton.css";

const SIZE_CLASS = {
  sm: "specular-button--sm",
  md: "specular-button--md",
  lg: "specular-button--lg"
};

const toRgba = (color, opacity) => {
  if (!color.startsWith("#")) return color;
  const value = color.slice(1);
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;
  const number = Number.parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const SpecularButton = forwardRef(function SpecularButton({
  children,
  size = "md",
  radius = 14,
  tint = "#ffffff",
  tintOpacity = 0.08,
  blur = 8,
  textColor = "#ffffff",
  lineColor = "#ffffff",
  baseColor = "#333333",
  intensity = 1,
  shineSize = 12,
  shineFade = 44,
  thickness = 1,
  speed = 0.4,
  followMouse = false,
  proximity = 180,
  autoAnimate = true,
  className = "",
  href,
  onClick,
  ...rest
}, forwardedRef) {
  const elementRef = useRef(null);
  useImperativeHandle(forwardedRef, () => elementRef.current);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !followMouse) return undefined;

    const handlePointerMove = (event) => {
      const rect = element.getBoundingClientRect();
      const deltaX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const deltaY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      const distance = Math.hypot(deltaX, deltaY);
      const visibility = Math.max(0, 1 - distance / proximity);
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      element.style.setProperty("--specular-x", `${x}px`);
      element.style.setProperty("--specular-y", `${y}px`);
      element.style.setProperty("--specular-opacity", String(visibility));
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [followMouse, proximity]);

  const Element = href ? "a" : "button";
  const styles = {
    "--specular-radius": `${radius}px`,
    "--specular-tint": toRgba(tint, tintOpacity),
    "--specular-blur": `${blur}px`,
    "--specular-text": textColor,
    "--specular-line": lineColor,
    "--specular-base": baseColor,
    "--specular-intensity": intensity,
    "--specular-shine-size": `${shineSize}%`,
    "--specular-shine-fade": `${shineFade}%`,
    "--specular-thickness": `${thickness}px`,
    "--specular-speed": `${speed}s`
  };

  return (
    <Element
      ref={elementRef}
      className={[
        "specular-button",
        SIZE_CLASS[size] || SIZE_CLASS.md,
        autoAnimate ? "is-auto-animated" : "",
        className
      ].filter(Boolean).join(" ")}
      href={href}
      type={href ? undefined : "button"}
      onClick={onClick}
      style={styles}
      {...rest}
    >
      <span className="specular-button__shine" aria-hidden="true" />
      <span className="specular-button__content">{children}</span>
    </Element>
  );
});

export default SpecularButton;
