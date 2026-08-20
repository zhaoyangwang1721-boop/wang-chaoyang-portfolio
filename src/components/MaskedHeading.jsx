import "./MaskedHeading.css";

export default function MaskedHeading({ lines = [], className = "" }) {
  return (
    <h1 className={`masked-heading ${className}`.trim()}>
      {lines.map((line, index) => (
        <span
          className={`masked-heading__line ${line.className || ""}`.trim()}
          data-text={line.text}
          style={{ "--masked-heading-delay": `${line.delay ?? index * 0.18}s` }}
          key={`${line.text}-${index}`}
        >
          {line.text}
        </span>
      ))}
    </h1>
  );
}
