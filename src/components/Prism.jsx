import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Prism.css";

const Prism = ({
  animationType = "3drotate",
  glow = 2.1,
  noise = 0.12,
  transparent = false,
  scale = 4.1,
  hueShift = -0.12,
  colorFrequency = 1.15,
  hoverStrength = 0.8,
  inertia = 0.06,
  bloom = 1.8,
  timeScale = 0.34
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(1.5, window.devicePixelRatio || 1),
      alpha: transparent,
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
      uniform float uGlow;
      uniform float uNoise;
      uniform float uScale;
      uniform float uHue;
      uniform float uColorFreq;
      uniform float uBloom;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      mat2 rotate2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      vec3 palette(float t) {
        vec3 a = vec3(0.48, 0.42, 0.55);
        vec3 b = vec3(0.48, 0.45, 0.42);
        vec3 c = vec3(1.0);
        vec3 d = vec3(0.04 + uHue, 0.33 + uHue, 0.67 + uHue);
        return a + b * cos(6.28318 * (c * t * uColorFreq + d));
      }

      float prism(vec2 p, float rotation) {
        p *= rotate2d(rotation);
        p.x = abs(p.x);
        return max(p.x * 0.866025 + p.y * 0.5, -p.y) - 0.48;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
        uv /= max(0.001, uScale * 0.34);

        float t = uTime;
        vec2 pointer = uPointer * 0.16;
        vec2 p = uv - pointer;
        float angle = t * 0.22 + sin(t * 0.31) * 0.22;

        float shape = prism(p, angle);
        float inner = abs(shape);
        float halo = exp(-inner * (6.0 + uGlow * 2.0));
        float core = 0.018 / max(inner, 0.012);

        vec2 beamP = p * rotate2d(-angle * 0.7);
        float beamA = exp(-abs(beamP.y + beamP.x * 0.28) * 5.5);
        float beamB = exp(-abs(beamP.y - beamP.x * 0.52) * 7.0);
        float facets = 0.5 + 0.5 * sin((atan(p.y, p.x) * 3.0 + t) * 1.4);

        vec3 color = palette(length(p) * 0.48 + facets * 0.18 + t * 0.045);
        vec3 result = color * (halo * 2.7 + core * 0.16) * uBloom;
        result += palette(t * 0.03 + 0.18) * beamA * halo * 1.4;
        result += palette(t * 0.025 + 0.62) * beamB * halo * 1.05;

        float vignette = 1.0 - smoothstep(0.45, 1.75, length(uv));
        result *= 0.48 + vignette * 1.05;
        result += (hash(gl_FragCoord.xy + t) - 0.5) * uNoise * 0.075;
        result *= 1.0 + uGlow * 0.22;
        result = result / (vec3(1.0) + result);

        gl_FragColor = vec4(result, 1.0);
      }
    `;

    const pointer = { current: [0, 0], target: [0, 0] };
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uPointer: { value: pointer.current },
        uGlow: { value: glow },
        uNoise: { value: noise },
        uScale: { value: scale },
        uHue: { value: hueShift },
        uColorFreq: { value: colorFrequency },
        uBloom: { value: bloom }
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
      pointer.target[0] = (event.clientX / window.innerWidth - 0.5) * 2 * hoverStrength;
      pointer.target[1] = -(event.clientY / window.innerHeight - 0.5) * 2 * hoverStrength;
    };
    if (animationType === "hover" || animationType === "3drotate") {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    let frame = 0;
    const startedAt = performance.now();
    const render = (now) => {
      pointer.current[0] += (pointer.target[0] - pointer.current[0]) * inertia;
      pointer.current[1] += (pointer.target[1] - pointer.current[1]) * inertia;
      program.uniforms.uTime.value = (now - startedAt) * 0.001 * timeScale;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [
    animationType,
    bloom,
    colorFrequency,
    glow,
    hoverStrength,
    hueShift,
    inertia,
    noise,
    scale,
    timeScale,
    transparent
  ]);

  return <div className="prism-container" ref={containerRef} />;
};

export default Prism;
