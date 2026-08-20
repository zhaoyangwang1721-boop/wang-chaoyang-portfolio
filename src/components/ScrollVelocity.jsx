import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from "motion/react";
import "./ScrollVelocity.css";

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const updateWidth = () => setWidth(ref.current?.offsetWidth ?? 0);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity,
  className,
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping.input,
    velocityMapping.output,
    { clamp: false }
  );
  const copyRef = useRef(null);
  const copyWidth = useElementWidth(copyRef);
  const directionFactor = useRef(1);

  const x = useTransform(baseX, value => {
    if (!copyWidth) return "0px";
    const wrapped = ((((value + copyWidth) % copyWidth) + copyWidth) % copyWidth) - copyWidth;
    return `${wrapped}px`;
  });

  useAnimationFrame((_, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const factor = velocityFactor.get();
    if (factor < 0) directionFactor.current = -1;
    if (factor > 0) directionFactor.current = 1;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    moveBy += directionFactor.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={parallaxClassName}>
      <motion.div className={scrollerClassName} style={{ x }}>
        {Array.from({ length: numCopies }, (_, index) => (
          <span className={className} key={index} ref={index === 0 ? copyRef : null} aria-hidden={index > 0 ? "true" : undefined}>
            {children}<span className="scroll-velocity__spacer" aria-hidden="true"> </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  texts = [],
  velocity = 34,
  className = "",
  damping = 50,
  stiffness = 400,
  numCopies = 4,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = "scroll-velocity__parallax",
  scrollerClassName = "scroll-velocity__scroller"
}) {
  return (
    <div className="scroll-velocity">
      {texts.map((text, index) => (
        <VelocityText
          key={text}
          className={className}
          baseVelocity={index % 2 ? -velocity : velocity}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
        >
          {text}
        </VelocityText>
      ))}
    </div>
  );
}
