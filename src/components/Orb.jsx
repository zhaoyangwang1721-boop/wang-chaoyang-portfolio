import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl";
import "./Orb.css";

function hexToVec3(color) {
  const normalized = color.replace("#", "").padEnd(6, "0").slice(0, 6);
  return new Vec3(
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255
  );
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = "#000000",
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
    Object.assign(gl.canvas.style, { position: "absolute", inset: "0", display: "block" });
    container.appendChild(gl.canvas);

    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      uniform float iTime;
      uniform vec3 iResolution;
      uniform float hue;
      uniform float hover;
      uniform float rot;
      uniform float hoverIntensity;
      uniform vec3 backgroundColor;
      varying vec2 vUv;

      mat2 rotate2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      vec3 hueShift(vec3 color, float angle) {
        const mat3 rgbToYiq = mat3(
          0.299, 0.587, 0.114,
          0.596, -0.274, -0.322,
          0.211, -0.523, 0.312
        );
        const mat3 yiqToRgb = mat3(
          1.0, 0.956, 0.621,
          1.0, -0.272, -0.647,
          1.0, -1.106, 1.703
        );
        vec3 yiq = rgbToYiq * color;
        yiq.yz = rotate2d(angle) * yiq.yz;
        return clamp(yiqToRgb * yiq, 0.0, 1.0);
      }

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
        float amplitude = 0.52;
        for (int index = 0; index < 5; index++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + vec2(7.1, 3.7);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = (vUv * iResolution.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
        uv *= rotate2d(rot);
        float time = iTime * 0.28;
        float radius = length(uv);
        float angle = atan(uv.y, uv.x);
        float edgeWarp = fbm(vec2(angle * 1.45 + time, radius * 3.2 - time)) - 0.5;
        float orbRadius = 0.79 + edgeWarp * 0.07 + hover * hoverIntensity * 0.055;
        float sphere = sqrt(max(0.0, 1.0 - pow(radius / max(0.01, orbRadius), 2.0)));
        vec2 surface = uv * (1.8 + sphere * 1.1);
        surface += vec2(
          fbm(surface * 1.5 + vec2(time, -time * 0.7)),
          fbm(surface * 1.55 + vec2(-time * 0.6, time))
        ) * (0.65 + hover * hoverIntensity);
        float flowA = fbm(surface * 1.7 + vec2(time * 0.8, -time));
        float flowB = fbm(surface * 3.2 - vec2(time * 0.55, time * 0.35));
        float ribbons = sin((surface.x + surface.y) * 5.5 + flowA * 7.0 - time * 4.0) * 0.5 + 0.5;
        vec3 violet = vec3(0.44, 0.12, 1.0);
        vec3 cyan = vec3(0.12, 0.72, 1.0);
        vec3 pink = vec3(1.0, 0.3, 0.8);
        vec3 color = mix(violet, cyan, smoothstep(0.16, 0.9, flowA));
        color = mix(color, pink, ribbons * flowB * 0.42);
        color = hueShift(color, radians(hue));
        color *= 0.5 + sphere * 0.9;
        color += vec3(0.78, 0.88, 1.0) * pow(max(0.0, 1.0 - abs(radius - orbRadius) * 13.0), 3.0) * 0.9;
        color += vec3(1.0) * pow(max(0.0, sphere), 9.0) * 0.36;
        float alpha = 1.0 - smoothstep(orbRadius - 0.035, orbRadius + 0.018, radius);
        float halo = exp(-max(0.0, radius - orbRadius) * 7.0) * (1.0 - alpha) * 0.5;
        vec3 finalColor = mix(backgroundColor, color, alpha);
        finalColor += hueShift(violet, radians(hue)) * halo;
        finalColor += (hash21(gl_FragCoord.xy + iTime) - 0.5) * 0.012;
        gl_FragColor = vec4(max(finalColor, 0.0), 1.0);
      }
    `;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(1, 1, 1) },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
        backgroundColor: { value: hexToVec3(backgroundColor) }
      }
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
      program.uniforms.iResolution.value.set(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight)
      );
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let targetHover = forceHoverState ? 1 : 0;
    let currentRotation = 0;
    const handlePointerMove = (event) => {
      if (window.scrollY <= window.innerHeight * 0.45) {
        targetHover = forceHoverState ? 1 : 0;
        return;
      }
      const x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const y = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      targetHover = Math.hypot(x, y) < 0.82 ? 1 : 0;
    };
    const handlePointerLeave = () => { targetHover = forceHoverState ? 1 : 0; };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    let frame = 0;
    let previousTime = performance.now();
    const render = (time) => {
      const delta = Math.min(0.05, (time - previousTime) * 0.001);
      previousTime = time;
      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.08;
      if (rotateOnHover && effectiveHover > 0.5) currentRotation += delta * 0.3;
      program.uniforms.rot.value = currentRotation;
      program.uniforms.iTime.value = reducedMotion.matches ? 1.2 : time * 0.001;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [backgroundColor, forceHoverState, hoverIntensity, hue, rotateOnHover]);

  return <div className={`orb-container ${className}`.trim()} ref={containerRef} />;
}
