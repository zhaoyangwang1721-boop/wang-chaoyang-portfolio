import "./StarBorder.css";

export default function StarBorder({
  as: Component = "div",
  children,
  color = "#ffffff",
  speed = "5s",
  thickness = 1,
  className = "",
  style,
  ...props
}) {
  return (
    <Component
      {...props}
      className={`star-border-container ${className}`.trim()}
      style={{
        ...style,
        "--star-border-color": color,
        "--star-border-speed": speed,
        "--star-border-thickness": `${thickness}px`
      }}
    >
      <i className="star-border__ray star-border__ray--top" aria-hidden="true" />
      <i className="star-border__ray star-border__ray--bottom" aria-hidden="true" />
      <i className="star-border__line" aria-hidden="true" />
      {children}
    </Component>
  );
}
