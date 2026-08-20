import { useId } from "react";
import "./WarpText.css";

export default function WarpText({
  text,
  intensity = 9,
  speed = 4.8,
  className = ""
}) {
  const filterId = `warp-text-${useId().replace(/:/g, "")}`;

  return (
    <div className={`warp-text-wrap ${className}`.trim()}>
      <svg className="warp-text__filter" aria-hidden="true">
        <filter id={filterId} x="-8%" y="-12%" width="116%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.022"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur={`${speed}s`}
              values="0.005 0.018;0.009 0.032;0.004 0.024;0.005 0.018"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={intensity} xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </svg>
      <h2 className="warp-text" data-text={text} style={{ filter: `url(#${filterId})` }}>{text}</h2>
    </div>
  );
}
