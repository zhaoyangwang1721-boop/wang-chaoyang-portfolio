/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Color } from "three";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";

const hexToNormalizedRGB = (hex) => {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;

uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = G * sin(G * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
    0.4 * sin(
      5.0 * (
        tex.x + tex.y +
        cos(3.0 * tex.x + 5.0 * tex.y) +
        0.02 * tOffset
      ) +
      sin(20.0 * (tex.x + tex.y - 0.1 * tOffset))
    );

  vec4 color = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  color.a = 1.0;
  gl_FragColor = color;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    ref.current?.scale.set(viewport.width, viewport.height, 1);
  }, [ref, viewport]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});

export default function Silk({
  speed = 5,
  scale = 1,
  color = "#7b7481",
  noiseIntensity = 1.5,
  rotation = 0
}) {
  const meshRef = useRef();
  const uniforms = useMemo(() => ({
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(...hexToNormalizedRGB(color)) },
    uRotation: { value: rotation },
    uTime: { value: 0 }
  }), []);

  useEffect(() => {
    uniforms.uSpeed.value = speed;
    uniforms.uScale.value = scale;
    uniforms.uNoiseIntensity.value = noiseIntensity;
    uniforms.uColor.value.setRGB(...hexToNormalizedRGB(color));
    uniforms.uRotation.value = rotation;
  }, [color, noiseIntensity, rotation, scale, speed, uniforms]);

  return (
    <Canvas dpr={[1, 1.5]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
}
