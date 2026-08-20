import { useEffect, useId, useRef, useState } from "react";
import "./CurvedInput.css";

export default function CurvedInput({
  value,
  defaultValue = "",
  onChange,
  ariaLabel,
  width = 450,
  bend = 28,
  height = 64,
  fontSize = 16,
  fontWeight = 500,
  letterSpacing = 0,
  textColor = "#f5f5f5",
  backgroundColor = "transparent",
  borderColor = "transparent",
  borderWidth = 0,
  fitText = false,
  readOnly = false,
  className = "",
  style = {}
}) {
  const id = useId().replace(/:/g, "");
  const pathId = `curved-input-text-${id}`;
  const rootRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(typeof width === "number" ? width : 450);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const displayedValue = value === undefined ? innerValue : value;

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.round(entry?.contentRect?.width || node.clientWidth || measuredWidth);
      if (nextWidth > 2) setMeasuredWidth(nextWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [measuredWidth]);

  const padding = Math.max(8, fontSize * 0.08);
  const baseline = height * 0.68;
  const controlY = baseline - bend * 2;
  const path = `M ${padding} ${baseline} Q ${measuredWidth / 2} ${controlY} ${measuredWidth - padding} ${baseline}`;
  const content = (
    <svg className="curved-input__svg" viewBox={`0 0 ${measuredWidth} ${height}`} aria-hidden="true">
      {backgroundColor !== "transparent" || borderColor !== "transparent" ? (
        <rect x={borderWidth / 2} y={borderWidth / 2} width={measuredWidth - borderWidth} height={height - borderWidth}
          rx={height / 3} fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidth} />
      ) : null}
      <path id={pathId} d={path} fill="none" />
      <text fill={textColor} style={{ fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` }}>
        <textPath href={`#${pathId}`} startOffset="0" textLength={fitText ? measuredWidth - padding * 2 : undefined}
          lengthAdjust={fitText ? "spacingAndGlyphs" : undefined}>{displayedValue}</textPath>
      </text>
    </svg>
  );

  if (readOnly) {
    return <span ref={rootRef} className={`curved-input ${className}`.trim()}
      style={{ width: typeof width === "number" ? `${width}px` : width, ...style }} role="img" aria-label={ariaLabel || displayedValue}>{content}</span>;
  }

  return (
    <label ref={rootRef} className={`curved-input ${className}`.trim()}
      style={{ width: typeof width === "number" ? `${width}px` : width, ...style }}>
      {content}
      <input className="curved-input__field" value={displayedValue} aria-label={ariaLabel || "Curved input"}
        onChange={(event) => { setInnerValue(event.target.value); onChange?.(event.target.value); }} />
    </label>
  );
}
