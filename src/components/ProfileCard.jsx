import React, { useRef } from "react";
import "./ProfileCard.css";

export default function ProfileCard({
  avatarUrl,
  name = "王朝阳",
  title = "AI时代传播增长顾问",
  className = ""
}) {
  const cardRef = useRef(null);

  const handlePointerMove = (event) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--profile-x", `${x * 100}%`);
    card.style.setProperty("--profile-y", `${y * 100}%`);
    card.style.setProperty("--profile-rotate-x", `${(0.5 - y) * 7}deg`);
    card.style.setProperty("--profile-rotate-y", `${(x - 0.5) * 7}deg`);
  };

  const resetCard = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--profile-rotate-x", "0deg");
    card.style.setProperty("--profile-rotate-y", "0deg");
  };

  return (
    <figure
      ref={cardRef}
      className={`profile-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
    >
      <img src={avatarUrl} alt={`${name}黑白肖像`} width="960" height="1440" loading="lazy" />
      <div className="profile-card__shine" aria-hidden="true" />
      <figcaption>
        <span>{name}</span>
        <small>{title}</small>
      </figcaption>
    </figure>
  );
}
