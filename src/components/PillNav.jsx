import React, { useEffect, useState } from "react";
import "./PillNav.css";

export default function PillNav({ items, className = "" }) {
  const [activeHref, setActiveHref] = useState(items[0]?.href || "#home");

  useEffect(() => {
    const sections = items.map((item) => document.querySelector(item.href)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-32% 0px -58%", threshold: [0, .15, .4] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className={`pill-nav ${className}`.trim()}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={activeHref === item.href ? "is-active" : ""}
          aria-current={activeHref === item.href ? "page" : undefined}
          onClick={() => setActiveHref(item.href)}
        >
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
}
