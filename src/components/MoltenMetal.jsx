import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./MoltenMetal.css";

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  const value = normalized.length === 3
    ? normalized.split("").map((character) => character + character).join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  const number = Number.parseInt(value, 16);
  return [
    ((number >> 16) & 255) / 255,
    ((number >> 8) & 255) / 255,
    (number & 255) / 255
  ];
}

export default function MoltenMetal({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = "molten",
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  opacity = 1,
  className = ""
}) {
  const containerRef = useRef(null);

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
      display: "block",
      opacity: String(opacity)
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
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uScale;
      uniform float uDetail;
      uniform float uGlow;
      uniform float uCoreSize;
      uniform float uSwirl;
      uniform float uFold;
      uniform float uBlackPoint;
      uniform float uBrightness;
      uniform float uMoltenMode;
      uniform float uGrain;
      uniform float uGrainIntensity;
      uniform float uMouseStrength;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.54;
        for (int octave = 0; octave < 6; octave++) {
          if (float(octave) >= uDetail) break;
          value += noise(p) * amplitude;
          p = p * 2.06 + vec2(12.7, 8.9);
          amplitude *= 0.52;
        }
        return value;
      }

      float moltenField(vec2 p) {
        float t = uTime;
        float radius = length(p);
        float angle = atan(p.y, p.x) + uSwirl * (0.18 * radius + t * 0.13);
        vec2 twisted = vec2(cos(angle), sin(angle)) * radius;
        vec2 flow = vec2(t * 0.13, -t * 0.19);
        float first = fbm(twisted + flow);
        vec2 warp = vec2(
          fbm(twisted * 1.16 + first + vec2(2.1, 7.2) - flow * 0.55),
          fbm(twisted * 1.12 - first + vec2(8.3, 2.8) + flow * 0.42)
        );
        float field = fbm(twisted + (warp - 0.5) * (1.35 + uSwirl * 0.24));
        field += sin((twisted.x - twisted.y + warp.x * 1.4) * 2.7 - t * 0.24) * 0.12;
        field += uFold * sin((twisted.x + twisted.y) * 5.0 + warp.y * 4.0) * 0.16;
        if (uPointerActive > 0.5) {
          float pointerDistance = length(p - uPointer);
          field += exp(-pointerDistance * 2.6) * uMouseStrength;
        }
        return field;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
        vec2 p = uv * uScale;
        float field = moltenField(p);
        float epsilon = 0.012;
        vec2 slope = vec2(
          moltenField(p + vec2(epsilon, 0.0)) - moltenField(p - vec2(epsilon, 0.0)),
          moltenField(p + vec2(0.0, epsilon)) - moltenField(p - vec2(0.0, epsilon))
        );
        vec3 normal = normalize(vec3(-slope * 10.0, 1.0));
        vec3 keyLight = normalize(vec3(-0.45, 0.72, 0.82));
        vec3 fillLight = normalize(vec3(0.68, -0.28, 0.68));
        float diffuse = max(dot(normal, keyLight), 0.0);
        float fill = max(dot(normal, fillLight), 0.0);
        float specular = pow(max(dot(reflect(-keyLight, normal), vec3(0.0, 0.0, 1.0)), 0.0), 22.0);

        float band = smoothstep(0.3, 0.7, field);
        float core = pow(clamp(1.0 - abs(field - 0.52) / max(0.025, uCoreSize), 0.0, 1.0), 2.4);
        float vein = pow(clamp(1.0 - abs(field - 0.46) * (5.4 + uCoreSize * 8.0), 0.0, 1.0), 2.8);
        vec3 palette = mix(uColor1, uColor2, band);
        palette = mix(palette, uColor3, clamp(core * 0.72 + specular * 0.82, 0.0, 1.0));
        vec3 color = palette * (0.34 + diffuse * 0.66 + fill * 0.2);
        color += uColor2 * vein * uGlow * 0.34;
        color += uColor3 * core * uGlow * 0.28;
        color += uColor3 * specular * uGlow;
        if (uMoltenMode < 0.5) color = mix(palette, color, 0.72);
        color = max(color - vec3(uBlackPoint), vec3(0.0)) * uBrightness;
        color = color / (vec3(1.0) + color * 0.2);
        if (uGrain > 0.5) {
          float grainValue = hash21(gl_FragCoord.xy + vec2(uTime * 137.0));
          color += (grainValue - 0.5) * uGrainIntensity;
        }
        gl_FragColor = vec4(max(color, 0.0), 1.0);
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
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uColor3: { value: hexToRgb(color3) },
        uScale: { value: scale },
        uDetail: { value: Math.max(1, Math.min(6, detail)) },
        uGlow: { value: glow },
        uCoreSize: { value: coreSize },
        uSwirl: { value: swirl },
        uFold: { value: fold },
        uBlackPoint: { value: blackPoint },
        uBrightness: { value: brightness },
        uMoltenMode: { value: colorMode === "molten" ? 1 : 0 },
        uGrain: { value: grain ? 1 : 0 },
        uGrainIntensity: { value: grainIntensity },
        uMouseStrength: { value: mouseStrength }
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
      if (!mouseInteraction || window.scrollY <= window.innerHeight * 0.45) return;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      pointer.target[0] = ((event.clientX / window.innerWidth) * 2 - 1) * aspect * scale;
      pointer.target[1] = -((event.clientY / window.innerHeight) * 2 - 1) * scale;
      pointer.active = 1;
    };
    const handlePointerLeave = () => { pointer.active = 0; };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    let frame = 0;
    let running = false;
    const startedAt = performance.now();
    const render = (now) => {
      pointer.current[0] += (pointer.target[0] - pointer.current[0]) * 0.06;
      pointer.current[1] += (pointer.target[1] - pointer.current[1]) * 0.06;
      program.uniforms.uPointer.value = pointer.current;
      program.uniforms.uPointerActive.value = mouseInteraction ? pointer.active : 0;
      program.uniforms.uTime.value = reducedMotion.matches ? 0.7 : (now - startedAt) * 0.001 * speed;
      renderer.render({ scene: mesh });
      if (running && !reducedMotion.matches) frame = requestAnimationFrame(render);
    };
    const updateRunningState = () => {
      const shouldRun = window.scrollY > window.innerHeight * 0.45 && !reducedMotion.matches;
      if (window.scrollY <= window.innerHeight * 0.45) pointer.active = 0;
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
  }, [blackPoint, brightness, color1, color2, color3, colorMode, coreSize, detail, fold, glow, grain, grainIntensity, mouseInteraction, mouseStrength, opacity, scale, speed, swirl]);

  return <div className={`molten-metal-container ${className}`.trim()} ref={containerRef} />;
}
