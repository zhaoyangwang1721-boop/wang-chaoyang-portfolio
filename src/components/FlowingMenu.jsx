import "./FlowingMenu.css";

export default function FlowingMenu({ items, className = "" }) {
  return (
    <div className={`flowing-menu ${className}`.trim()} role="list">
      {items.map((item) => (
        <article
          className="flowing-menu__item"
          key={item.index}
          role="listitem"
          tabIndex={0}
          aria-label={`${item.index} ${item.title} ${item.text}`}
        >
          <div className="flowing-menu__marquee" aria-hidden="true">
            <div className="flowing-menu__track">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index}><b>{item.index}</b>{item.title}</span>
              ))}
            </div>
          </div>
          <span className="flowing-menu__index">{item.index}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
