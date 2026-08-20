import { useEffect, useMemo, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Ferrofluid.css";

const DEFAULT_COLORS = ["#ffffff", "#ffffff", "#ffffff"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function colorToVector(color) {
  const value = color.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value.padEnd(6, "f").slice(0, 6);
  const number = Number.parseInt(normalized, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
}

export default function Ferrofluid({
  colors = DEFAULT_COLORS,
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = "down",
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  className = ""
}) {
  const containerRef = useRef(null);
  const colorVectors = useMemo(() => {
    const safeColors = colors.length ? colors : DEFAULT_COLORS;
    return [0, 1, 2].map((index) => colorToVector(safeColors[index % safeColors.length]));
  }, [colors]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(1.5, window.devicePixelRatio || 1),
      alpha: false,
      antialias: false
    });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      display: "block"
    });
    container.appendChild(gl.canvas);

    const vertex = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragment = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uPointerActive;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform float uScale;
      uniform float uTurbulence;
      uniform float uFluidity;
      uniform float uRimWidth;
      uniform float uSharpness;
      uniform float uShimmer;
      uniform float uGlow;
      uniform float uDirection;
      uniform float uOpacity;
      uniform float uMouseStrength;
      uniform float uMouseRadius;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
                   mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int octave = 0; octave < 4; octave++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + vec2(17.1, 9.2);
          amplitude *= 0.5;
        }
        return value;
      }

      float fluidField(vec2 p) {
        float field = 0.0;
        float t = uTime;
        for (int index = 0; index < 12; index++) {
          float id = float(index);
          float progress = fract(id * 0.173 + t * (0.022 + mod(id, 3.0) * 0.004));
          float vertical = mix(0.95, -0.95, progress);
          if (uDirection < 0.0) vertical = -vertical;
          float horizontal = sin(id * 2.41 + t * (0.23 + id * 0.006)) * 0.72;
          horizontal += sin(vertical * 3.4 + id) * uFluidity * 1.8;
          vec2 center = vec2(horizontal, vertical);
          float radius = 0.12 + 0.068 * (0.5 + 0.5 * sin(id * 4.73));
          vec2 delta = p - center;
          float warp = sin(delta.x * 7.0 + id + t * 0.18) * sin(delta.y * 6.0 - id * 0.7 - t * 0.14) * uTurbulence * 0.055;
          float distanceSquared = max(0.008, dot(delta, delta) + warp * 0.034);
          field += radius * radius / distanceSquared;
        }

        if (uPointerActive > 0.5) {
          vec2 mouseDelta = p - uPointer;
          float radius = max(0.04, uMouseRadius);
          field += uMouseStrength * radius * radius * 0.52 / (dot(mouseDelta, mouseDelta) + 0.018);
        }
        field += (fbm(p * 2.7 + vec2(t * 0.025, -t * 0.04 * uDirection)) - 0.5) * uTurbulence * 0.15;
        return field;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
        vec2 p = uv * max(0.2, 0.65 + uScale * 0.42);
        float field = fluidField(p);
        float edgeSoftness = 0.13 / max(0.5, uSharpness);
        float liquid = smoothstep(0.9 - edgeSoftness, 0.9 + edgeSoftness, field);

        float epsilon = 0.006;
        vec2 gradient = vec2(
          fluidField(p + vec2(epsilon, 0.0)) - fluidField(p - vec2(epsilon, 0.0)),
          fluidField(p + vec2(0.0, epsilon)) - fluidField(p - vec2(0.0, epsilon))
        );
        vec3 normal = normalize(vec3(-gradient * 4.2, 1.0));
        vec3 lightDirection = normalize(vec3(-0.48, 0.72, 0.92));
        float diffuse = clamp(dot(normal, lightDirection) * 0.5 + 0.5, 0.0, 1.0);
        float specular = pow(max(dot(reflect(-lightDirection, normal), vec3(0.0, 0.0, 1.0)), 0.0), 8.0 + uSharpness * 5.0);
        float rim = pow(1.0 - max(normal.z, 0.0), 1.4 + uRimWidth * 3.0);
        float shimmerNoise = fbm(p * 5.5 + uTime * vec2(0.08, -0.11));

        vec3 baseColor = mix(uColorA, uColorB, clamp(p.y * 0.38 + 0.5, 0.0, 1.0));
        baseColor = mix(baseColor, uColorC, shimmerNoise * 0.28);
        vec3 metal = baseColor * (0.34 + diffuse * 0.76);
        metal += baseColor * rim * uGlow * (0.42 + uRimWidth);
        metal += vec3(1.0) * specular * uShimmer * 1.9;
        metal += vec3(1.0) * pow(shimmerNoise, 7.0) * uShimmer * 0.12;

        float halo = smoothstep(0.54, 0.9, field) - liquid;
        vec3 color = metal * liquid + baseColor * halo * uGlow * 0.18;
        color = color / (vec3(1.0) + color * 0.18);
        gl_FragColor = vec4(color * uOpacity, 1.0);
      }
    `;

    const pointer = { current: [0, 0], target: [0, 0], active: 0 };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uPointer: { value: pointer.current },
        uPointerActive: { value: 0 },
        uColorA: { value: colorVectors[0] },
        uColorB: { value: colorVectors[1] },
        uColorC: { value: colorVectors[2] },
        uScale: { value: scale },
        uTurbulence: { value: turbulence },
        uFluidity: { value: fluidity },
        uRimWidth: { value: rimWidth },
        uSharpness: { value: sharpness },
        uShimmer: { value: shimmer },
        uGlow: { value: glow },
        uDirection: { value: flowDirection === "up" ? -1 : 1 },
        uOpacity: { value: clamp(opacity, 0, 1) },
        uMouseStrength: { value: mouseStrength },
        uMouseRadius: { value: mouseRadius }
      }
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const handlePointerMove = (event) => {
      if (!mouseInteraction) return;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      pointer.target[0] = ((event.clientX / window.innerWidth) * 2 - 1) * aspect * coordinateScale;
      pointer.target[1] = -((event.clientY / window.innerHeight) * 2 - 1) * coordinateScale;
      pointer.active = 1;
    };
    const handlePointerLeave = () => { pointer.active = 0; };
    const coordinateScale = Math.max(0.2, 0.65 + scale * 0.42);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    let frame = 0;
    let running = false;
    const startedAt = performance.now();
    const render = (now) => {
      pointer.current[0] += (pointer.target[0] - pointer.current[0]) * 0.075;
      pointer.current[1] += (pointer.target[1] - pointer.current[1]) * 0.075;
      program.uniforms.uPointer.value = pointer.current;
      program.uniforms.uPointerActive.value = mouseInteraction ? pointer.active : 0;
      program.uniforms.uTime.value = reducedMotion.matches ? 0.8 : (now - startedAt) * 0.001 * speed;
      renderer.render({ scene: mesh });
      if (running && !reducedMotion.matches) frame = requestAnimationFrame(render);
    };
    const updateRunningState = () => {
      const shouldRun = window.scrollY > window.innerHeight * 0.45 && !reducedMotion.matches;
      if (shouldRun === running) return;
      running = shouldRun;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(render);
      else render(performance.now());
    };
    const handleMotionChange = () => {
      running = false;
      cancelAnimationFrame(frame);
      render(performance.now());
      updateRunningState();
    };
    window.addEventListener("scroll", updateRunningState, { passive: true });
    reducedMotion.addEventListener("change", handleMotionChange);
    render(performance.now());
    updateRunningState();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("scroll", updateRunningState);
      reducedMotion.removeEventListener("change", handleMotionChange);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [
    colorVectors,
    flowDirection,
    fluidity,
    glow,
    mouseInteraction,
    mouseRadius,
    mouseStrength,
    opacity,
    rimWidth,
    scale,
    sharpness,
    shimmer,
    speed,
    turbulence
  ]);

  return <div className={`ferrofluid-container ${className}`.trim()} ref={containerRef} />;
}
