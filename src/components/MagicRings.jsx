import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./MagicRings.css";

const vertexShader = `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragmentShader = `
precision highp float;
uniform float uTime,uAttenuation,uLineThickness,uBaseRadius,uRadiusStep,uScaleRate,uOpacity,uNoiseAmount,uRotation,uRingGap,uMouseInfluence,uHoverAmount,uHoverScale,uParallax;
uniform vec2 uResolution,uMouse; uniform vec3 uColor,uColorTwo; uniform int uRingCount;
float ring(vec2 p,float radius,float phase,float px){float t=mod(uTime+phase,3.45);float r=radius+t/3.45*uScaleRate;float d=abs(length(p)-r);float fade=smoothstep(0.0,.62,t)*(1.0-smoothstep(2.5,3.35,t));return exp(-uAttenuation*d)*(1.0-smoothstep(px*uLineThickness,px*uLineThickness*1.7,d))*fade;}
void main(){float px=1.0/min(uResolution.x,uResolution.y);vec2 p=(gl_FragCoord.xy-.5*uResolution)*px;float cr=cos(uRotation),sr=sin(uRotation);p=mat2(cr,-sr,sr,cr)*p-uMouse*uMouseInfluence;p/=mix(1.0,uHoverScale,uHoverAmount);vec3 c=vec3(0.0);float total=max(float(uRingCount)-1.0,1.0);for(int i=0;i<10;i++){if(i>=uRingCount)break;float fi=float(i);vec2 pr=p-fi*uParallax*uMouse;vec3 rc=mix(uColor,uColorTwo,fi/total);c+=rc*ring(pr,uBaseRadius+fi*uRadiusStep,fi*.48,px);}float n=fract(sin(dot(gl_FragCoord.xy+uTime*80.0,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*uNoiseAmount;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b))*uOpacity);}`;

export default function MagicRings({ color = "#9a62ff", colorTwo = "#ff6fae", speed = 0.72, ringCount = 6, attenuation = 12, lineThickness = 2.4, baseRadius = 0.2, radiusStep = 0.075, scaleRate = 0.18, opacity = 0.86, noiseAmount = 0.025, rotation = -12, followMouse = true, mouseInfluence = 0.12, hoverScale = 1.08, parallax = 0.025, className = "" }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return undefined; }
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-.5,.5,.5,-.5,.1,10); camera.position.z=1;
    const uniforms = { uTime:{value:0},uAttenuation:{value:attenuation},uResolution:{value:new THREE.Vector2()},uColor:{value:new THREE.Color(color)},uColorTwo:{value:new THREE.Color(colorTwo)},uLineThickness:{value:lineThickness},uBaseRadius:{value:baseRadius},uRadiusStep:{value:radiusStep},uScaleRate:{value:scaleRate},uRingCount:{value:ringCount},uOpacity:{value:opacity},uNoiseAmount:{value:noiseAmount},uRotation:{value:rotation*Math.PI/180},uRingGap:{value:1.5},uMouse:{value:new THREE.Vector2()},uMouseInfluence:{value:followMouse?mouseInfluence:0},uHoverAmount:{value:0},uHoverScale:{value:hoverScale},uParallax:{value:parallax} };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent:true, depthWrite:false });
    const geometry = new THREE.PlaneGeometry(1,1); const mesh = new THREE.Mesh(geometry,material); scene.add(mesh);
    const pointer={x:0,y:0,tx:0,ty:0,hover:0}; let raf=0; let visible=true; let previous=performance.now(); let elapsed=0;
    const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight,dpr=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);uniforms.uResolution.value.set(w*dpr,h*dpr)};
    const move=(event)=>{const rect=mount.getBoundingClientRect();pointer.tx=(event.clientX-rect.left)/rect.width-.5;pointer.ty=-((event.clientY-rect.top)/rect.height-.5);};
    const enter=()=>pointer.hover=1; const leave=()=>{pointer.hover=0;pointer.tx=0;pointer.ty=0};
    const render=(now)=>{if(!visible)return;const dt=Math.min(now-previous,80);previous=now;elapsed+=dt*.001*speed;pointer.x+=(pointer.tx-pointer.x)*.07;pointer.y+=(pointer.ty-pointer.y)*.07;uniforms.uTime.value=elapsed;uniforms.uMouse.value.set(pointer.x,pointer.y);uniforms.uHoverAmount.value+=(pointer.hover-uniforms.uHoverAmount.value)*.08;renderer.render(scene,camera);raf=requestAnimationFrame(render)};
    const observer=new ResizeObserver(resize); observer.observe(mount); const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!raf){previous=performance.now();raf=requestAnimationFrame(render)}else if(!visible&&raf){cancelAnimationFrame(raf);raf=0}});io.observe(mount);
    mount.addEventListener("pointermove",move);mount.addEventListener("pointerenter",enter);mount.addEventListener("pointerleave",leave);resize();raf=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();io.disconnect();mount.removeEventListener("pointermove",move);mount.removeEventListener("pointerenter",enter);mount.removeEventListener("pointerleave",leave);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
  }, [attenuation,baseRadius,color,colorTwo,followMouse,hoverScale,lineThickness,mouseInfluence,noiseAmount,opacity,parallax,radiusStep,ringCount,rotation,scaleRate,speed]);
  return <div ref={mountRef} className={`magic-rings-container ${className}`.trim()} aria-hidden="true" />;
}
