import "./GlitchText.css";

export default function GlitchText({
  text,
  as: Component = "h2",
  speed = 3.6,
  enableShadows = true,
  enableOnHover = false,
  className = ""
}) {
  return (
    <Component
      className={`glitch-text${enableShadows ? " glitch-text--shadows" : ""}${enableOnHover ? " glitch-text--hover" : ""} ${className}`.trim()}
      data-text={text}
      style={{ "--glitch-speed": `${speed}s` }}
    >
      {text}
    </Component>
  );
}
