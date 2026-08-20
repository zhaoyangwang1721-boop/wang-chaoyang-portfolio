import { useEffect, useMemo, useRef } from "react";
import "./DriftWall.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function DriftWall({
  items = [],
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = "#060010",
  radius = 14,
  roll = 0,
  pauseOnHover = false,
  grayscale = false,
  onItemClick,
  className = ""
}) {
  const wallRef = useRef(null);
  const safeColumns = clamp(Math.round(columns), 1, 8);
  const preparedColumns = useMemo(() => {
    if (!items.length) return [];
    return Array.from({ length: safeColumns }, (_, columnIndex) => {
      const offset = Math.floor((items.length / safeColumns) * columnIndex);
      return items.map((_, index) => {
        const originalIndex = (index + offset) % items.length;
        return { ...items[originalIndex], originalIndex };
      });
    });
  }, [items, safeColumns]);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || parallax <= 0) return undefined;

    let frame = 0;
    const handlePointerMove = (event) => {
      const rect = wall.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5;
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        wall.style.setProperty("--drift-pointer-x", `${x * parallax * 54}px`);
        wall.style.setProperty("--drift-pointer-y", `${y * parallax * 40}px`);
      });
    };
    const handlePointerLeave = () => {
      cancelAnimationFrame(frame);
      wall.style.setProperty("--drift-pointer-x", "0px");
      wall.style.setProperty("--drift-pointer-y", "0px");
    };

    wall.addEventListener("pointermove", handlePointerMove, { passive: true });
    wall.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      wall.removeEventListener("pointermove", handlePointerMove);
      wall.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [parallax]);

  if (!items.length) return null;

  const baseDuration = Math.max(18, (items.length * (tileHeight + gap)) / Math.max(1, speed));
  const styles = {
    "--drift-columns": safeColumns,
    "--drift-tile-width": `${tileWidth}px`,
    "--drift-tile-height": `${tileHeight}px`,
    "--drift-gap": `${gap}px`,
    "--drift-tilt": `${tilt}deg`,
    "--drift-turn": `${turn}deg`,
    "--drift-perspective": `${perspective}px`,
    "--drift-depth": `${depth}px`,
    "--drift-lift": `${lift}px`,
    "--drift-fade": clamp(fade, 0, 1),
    "--drift-dim": clamp(dim, 0, 1),
    "--drift-overlay": overlayColor,
    "--drift-radius": `${radius}px`,
    "--drift-roll": `${roll}deg`,
    "--drift-fade-top": `${18 + clamp(fade, 0, 1) * 8}%`,
    "--drift-fade-bottom": `${78 - clamp(fade, 0, 1) * 7}%`
  };

  return (
    <div
      ref={wallRef}
      className={`drift-wall ${pauseOnHover ? "drift-wall--pause" : ""} ${grayscale ? "drift-wall--grayscale" : ""} ${className}`.trim()}
      style={styles}
      role="region"
      aria-label="电影项目动态作品墙"
    >
      <div className="drift-wall__stage">
        <div className="drift-wall__plane">
          {preparedColumns.map((columnItems, columnIndex) => {
            const varianceOffset = ((columnIndex % 3) - 1) * variance;
            const duration = baseDuration * (1 + varianceOffset * 0.24);
            return (
              <div
                className="drift-wall__column"
                key={columnIndex}
                style={{
                  "--drift-column-depth": `${(columnIndex - (safeColumns - 1) / 2) * (depth / Math.max(1, safeColumns - 1))}px`,
                  "--drift-duration": `${duration}s`,
                  "--drift-delay": `${-duration * ((columnIndex * 0.137) % 1)}s`
                }}
              >
                <div className={`drift-wall__track drift-wall__track--${direction === "down" ? "down" : "up"}`}>
                  {[...columnItems, ...columnItems].map((item, repeatIndex) => {
                    const isAccessibleCopy = columnIndex === 0 && repeatIndex < columnItems.length;
                    const content = (
                      <>
                        <img src={item.image} alt="" loading="lazy" decoding="async" />
                        <span>{item.title}</span>
                      </>
                    );
                    const itemKey = `${item.originalIndex}-${repeatIndex}`;
                    return item.href ? (
                      <a
                        className="drift-wall__tile"
                        href={item.href}
                        key={itemKey}
                        aria-label={isAccessibleCopy ? `查看《${item.title}》项目海报` : undefined}
                        aria-hidden={isAccessibleCopy ? undefined : "true"}
                        tabIndex={isAccessibleCopy ? 0 : -1}
                        onClick={(event) => onItemClick?.(item, item.originalIndex, event)}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        className="drift-wall__tile"
                        type="button"
                        key={itemKey}
                        aria-label={isAccessibleCopy ? `查看《${item.title}》项目海报` : undefined}
                        aria-hidden={isAccessibleCopy ? undefined : "true"}
                        tabIndex={isAccessibleCopy ? 0 : -1}
                        onClick={(event) => onItemClick?.(item, item.originalIndex, event)}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="drift-wall__shade" aria-hidden="true" />
    </div>
  );
}
