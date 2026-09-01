import { useEffect, useMemo, useRef, useState } from "react";
import "./DriftWall.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function StaticPosterTile({ item, index, onItemClick }) {
  const tileRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) return undefined;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "280px 0px" });
    observer.observe(tile);
    return () => observer.disconnect();
  }, []);

  return (
    <button ref={tileRef} className={`drift-wall-static__tile${isLoaded ? " is-loaded" : ""}`} type="button" aria-label={`查看《${item.title}》项目海报`} onClick={(event) => onItemClick?.(item, index, event)}>
      <span className="drift-wall-static__placeholder" aria-hidden="true" />
      {shouldLoad ? (
        <img
          src={item.thumbnail ?? item.image}
          alt=""
          decoding="async"
          fetchPriority={index < 2 ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
        />
      ) : null}
      <span className="drift-wall-static__label">{item.title}</span>
    </button>
  );
}

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
  staticMode = false,
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

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || staticMode) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      wall.classList.toggle("drift-wall--active", entry.isIntersecting && !document.hidden);
    });
    const handleVisibilityChange = () => {
      const rect = wall.getBoundingClientRect();
      const visible = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight;
      wall.classList.toggle("drift-wall--active", visible);
    };
    observer.observe(wall);
    window.addEventListener("scroll", handleVisibilityChange, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [staticMode]);

  if (!items.length) return null;

  if (staticMode) {
    return (
      <div className={`drift-wall-static ${className}`.trim()} role="region" aria-label="电影项目静态作品墙">
        {items.map((item, index) => <StaticPosterTile item={item} index={index} key={item.id ?? item.title} onItemClick={onItemClick} />)}
      </div>
    );
  }

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
