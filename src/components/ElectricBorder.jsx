import { useId } from "react";
import "./ElectricBorder.css";

export default function ElectricBorder({
  children,
  color = "#839dff",
  speed = 1.35,
  chaos = 0.12,
  thickness = 2,
  radius = 0,
  className = "",
  style,
  ...props
}) {
  const filterId = `electric-border-${useId().replace(/:/g, "")}`;

  return (
    <div
      {...props}
      className={`electric-border ${className}`.trim()}
      style={{
        ...style,
        "--electric-color": color,
        "--electric-speed": `${speed}s`,
        "--electric-thickness": `${thickness}px`,
        "--electric-radius": `${radius}px`
      }}
    >
      <svg className="electric-border__svg" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency={chaos} numOctaves="2" seed="8" result="noise">
              <animate attributeName="seed" values="2;9;4;12;2" dur={`${speed * 1.8}s`} repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
      </svg>
      <i className="electric-border__glow" style={{ filter: `url(#${filterId})` }} aria-hidden="true" />
      <i className="electric-border__line" aria-hidden="true" />
      {children}
    </div>
  );
}
