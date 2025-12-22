import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
    selector?: string;      // qué elementos son vidrio
    fps?: number;           // 45–60 recomendado
    strength?: number;      // 10–26 (px) recomendado
    blur?: number;          // 0.8–2.2 recomendado
    chroma?: number;        // 0.0–0.14 recomendado (subtil)
    radius?: number;        // fallback si no lees radius desde CSS
};

const VERT = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D uBack;
uniform vec2 uRes;
uniform vec2 uSize;
uniform float uRadius;
uniform float uTime;

uniform float uStrength; // px
uniform float uBlur;     // 0..2-ish
uniform float uChroma;   // 0..0.15-ish

uniform vec3  uTint;
uniform float uTintA;

varying vec2 vUv;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<4;i++){
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

float sdRoundRect(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - (b - vec2(r));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec4 blur5(vec2 uv, vec2 px, vec2 d){
  // blur baratito (5 taps) + desplazamiento
  vec4 c = texture2D(uBack, uv + d) * 0.36;
  c += texture2D(uBack, uv + d + vec2(px.x, 0.0) * uBlur) * 0.16;
  c += texture2D(uBack, uv + d - vec2(px.x, 0.0) * uBlur) * 0.16;
  c += texture2D(uBack, uv + d + vec2(0.0, px.y) * uBlur) * 0.16;
  c += texture2D(uBack, uv + d - vec2(0.0, px.y) * uBlur) * 0.16;
  return c;
}

void main(){
  // gl_FragCoord: origen abajo-izq, DOM es arriba-izq => invertimos Y
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - (gl_FragCoord.y / uRes.y));
  vec2 px = 1.0 / uRes;

  // Distorsión uniforme (cut glass look) - ya no usamos edge fade
  // float edge = smoothstep(0.0, 0.40, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));

  // ruido animado (suave y liquido - ondas GRANDES)
  vec2 p = (uv * vec2(uRes.x/uRes.y, 1.0)) * 0.8; 
  float n1 = fbm(p * 0.8 + vec2(uTime * 0.05, uTime * 0.04));
  float n2 = fbm(p * 0.8 + vec2(9.3 + uTime * 0.04, 2.1 + uTime * 0.06));
  vec2 n = (vec2(n1, n2) - 0.5) * 4.0; // Amplifica el desplazamiento

  // wave muy sutil
  vec2 wave = vec2(
    sin((uv.y + uTime * 0.1) * 3.0),
    cos((uv.x + uTime * 0.08) * 3.0)
  ) * 0.1;

  // APLICA PROPIAMENTE LA FUERZA SIN MÁSCARA DE BORDE
  // Esto hace que el "corte" del vidrio sea visible en los bordes
  vec2 disp = (n + wave) * uStrength * px; 

  // aberración cromática
  vec2 ca = disp * uChroma;

  float r = blur5(uv + ca, px, disp).r;
  float g = blur5(uv,      px, disp).g;
  float b = blur5(uv - ca, px, disp).b;

  vec3 col = vec3(r,g,b);

  // “frost” + leve tinte (Apple-ish)
  col = mix(col, uTint, uTintA);
  col = clamp(col, 0.0, 1.0);

  // máscara rounded-rect en pixeles locales
  vec2 local = (vUv - 0.5) * uSize; // px en el quad
  float sd = sdRoundRect(local, uSize * 0.5, uRadius);
  float aa = fwidth(sd);
  float mask = 1.0 - smoothstep(0.0, aa, sd);

  // rim interno (borde luminoso)
  float rimW = 10.0; // px
  float rim = 1.0 - smoothstep(-rimW, 0.0, sd);
  col += rim * 0.06;

  // spec fijo (no mouse)
  float spec = smoothstep(0.75, 0.0, length(vUv - vec2(0.22, 0.18)));
  col += spec * 0.05;

  gl_FragColor = vec4(col, mask);
}
`;

export function LiquidGlassLayer({
    selector = '[data-liquid="1"]',
    fps = 60,
    strength = 22,       // Stronger distortion (visible refraction)
    blur = 1.5,          // Sharper refractions (less muddy)
    chroma = 0.12,       // Visible chromatic aberration
    radius = 22,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const back = document.getElementById("tg-backdrop") as HTMLCanvasElement | null;
        if (!canvas || !back) return;

        // Si three te da error de types:
        // Asegúrate de tener "three" actualizado: npm i three
        // (three ya trae types en versiones modernas)

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
        });

        // OJO: para rendimiento, NO subas demasiado el pixelRatio
        const pr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(pr);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);

        const tex = new THREE.CanvasTexture(back);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const baseUniforms = {
            uBack: { value: tex },
            uRes: { value: new THREE.Vector2(1, 1) },
            uSize: { value: new THREE.Vector2(1, 1) },
            uRadius: { value: radius * pr },
            uTime: { value: 0 },

            uStrength: { value: strength * pr },
            uBlur: { value: blur },
            uChroma: { value: chroma },

            // tint por theme (puedes ajustar)
            uTint: { value: new THREE.Color(0.92, 0.96, 1.0) },
            uTintA: { value: 0.06 },
        };

        const makeMat = () =>
            new THREE.ShaderMaterial({
                vertexShader: VERT,
                fragmentShader: FRAG,
                transparent: true,
                depthTest: false,
                depthWrite: false,
                uniforms: THREE.UniformsUtils.clone(baseUniforms),
            });

        const geo = new THREE.PlaneGeometry(1, 1);

        // registry de elementos
        const meshes = new Map<HTMLElement, THREE.Mesh>();

        const sync = () => {
            const els = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

            // add
            for (const el of els) {
                if (!meshes.has(el)) {
                    const mesh = new THREE.Mesh(geo, makeMat());
                    scene.add(mesh);
                    meshes.set(el, mesh);
                }
            }
            // remove
            for (const [el, mesh] of meshes.entries()) {
                if (!els.includes(el)) {
                    scene.remove(mesh);
                    (mesh.material as THREE.Material).dispose();
                    meshes.delete(el);
                }
            }
        };

        const resize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            renderer.setSize(vw, vh, false);
            camera.left = 0;
            camera.right = vw;
            camera.top = vh;
            camera.bottom = 0;
            camera.updateProjectionMatrix();

            const w = vw * pr;
            const h = vh * pr;
            for (const mesh of meshes.values()) {
                const mat = mesh.material as THREE.ShaderMaterial;
                mat.uniforms.uRes.value.set(w, h);
            }
        };

        let raf = 0;
        let last = 0;

        const loop = (t: number) => {
            const dt = 1000 / Math.max(1, fps);
            if (t - last < dt) {
                raf = requestAnimationFrame(loop);
                return;
            }
            last = t;

            tex.needsUpdate = true;
            sync();

            const vh = window.innerHeight;

            // theme → uniforms (tinte)
            const light = document.documentElement.classList.contains("theme-light");
            for (const [el, mesh] of meshes.entries()) {
                const r = el.getBoundingClientRect();
                const mat = mesh.material as THREE.ShaderMaterial;

                // posición en “pixeles” del mundo (camera es px)
                mesh.position.set(r.left + r.width / 2, (vh - r.top) - r.height / 2, 0);
                mesh.scale.set(r.width, r.height, 1);

                // size/radius en px reales del framebuffer
                mat.uniforms.uSize.value.set(r.width * pr, r.height * pr);

                // intenta leer radius real (si no, usa fallback)
                const rr = parseFloat(getComputedStyle(el).borderRadius || "0") || radius;
                mat.uniforms.uRadius.value = rr * pr;

                mat.uniforms.uTime.value = t * 0.001;

                // tint según theme (ajústalo a gusto)
                if (light) {
                    mat.uniforms.uTint.value.setRGB(1.0, 1.0, 1.0);
                    mat.uniforms.uTintA.value = 0.04;
                } else {
                    mat.uniforms.uTint.value.setRGB(0.92, 0.96, 1.0);
                    mat.uniforms.uTintA.value = 0.06;
                }
            }

            renderer.render(scene, camera);
            raf = requestAnimationFrame(loop);
        };

        sync();
        resize();
        window.addEventListener("resize", resize, { passive: true });
        window.addEventListener("scroll", sync, { passive: true });

        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", sync);

            tex.dispose();
            geo.dispose();

            for (const mesh of meshes.values()) {
                (mesh.material as THREE.Material).dispose();
            }
            renderer.dispose();
        };
    }, [selector, fps, strength, blur, chroma, radius]);

    return <canvas ref={canvasRef} className="tg-liquid-layer" aria-hidden="true" />;
}
