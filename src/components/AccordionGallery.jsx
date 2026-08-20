import { useState } from "react";
import "./AccordionGallery.css";

export default function AccordionGallery({
  items = [],
  initialIndex = 0,
  onItemSelect,
  className = ""
}) {
  const [activeIndex, setActiveIndex] = useState(Math.min(initialIndex, Math.max(0, items.length - 1)));

  const selectItem = (index) => {
    setActiveIndex(index);
    onItemSelect?.(items[index], index);
  };

  return (
    <div className={`accordion-gallery ${className}`.trim()} role="group" aria-label="代表电影项目手风琴画廊">
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <button
            className={`accordion-gallery__item ${active ? "is-active" : ""}`}
            key={item.id ?? item.title}
            type="button"
            aria-expanded={active}
            onClick={() => selectItem(index)}
            onMouseEnter={() => selectItem(index)}
            onFocus={() => selectItem(index)}
          >
            <img src={item.image} alt="" width="640" height="960" loading="lazy" />
            <span className="accordion-gallery__shade" />
            <span className="accordion-gallery__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="accordion-gallery__content">
              <small>{item.year} · {item.category}</small>
              <strong>{item.title}</strong>
              <em>{item.result}</em>
              <span>{item.summary}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
