import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import html2canvas from "html2canvas";

type LiquidGlassProps = React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & {
        strength?: number;     // 0.02..0.07
        blur?: number;         // 0.8..1.8
        chroma?: number;       // 0.0..0.14
        captureFps?: number;   // 0.5..1 recomendado
    }
>;

function makeNoiseTexture(size = 128) {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
        const o = i * 4;
        data[o + 0] = (Math.random() * 255) | 0;
        data[o + 1] = (Math.random() * 255) | 0;
        data[o + 2] = 128;
        data[o + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
}

const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;

uniform sampler2D uScene;
uniform sampler2D uNoise;
uniform vec2 uViewport;
uniform vec4 uRect;
uniform vec2 uMouse;
uniform float uTime;
uniform float uRefract;
uniform float uBlur;
uniform float uChroma;
uniform float uHover;

varying vec2 vUv;

vec4 tapBlur(vec2 uv){
  vec2 px = 1.0 / uViewport;
  float s = uBlur;

  vec4 c = texture2D(uScene, uv) * 0.42;
  c += texture2D(uScene, uv + vec2(px.x, 0.0) * s) * 0.145;
  c += texture2D(uScene, uv - vec2(px.x, 0.0) * s) * 0.145;
  c += texture2D(uScene, uv + vec2(0.0, px.y) * s) * 0.145;
  c += texture2D(uScene, uv - vec2(0.0, px.y) * s) * 0.145;
  return c;
}

void main(){
  vec2 uvScreen = (uRect.xy + vUv * uRect.zw) / uViewport;

  vec2 nUv = vUv * 2.0 + vec2(uTime * 0.03, uTime * 0.02);
  vec2 n = texture2D(uNoise, nUv).rg * 2.0 - 1.0;

  float edge = smoothstep(0.0, 0.50, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  n *= edge;

  float md = distance(vUv, uMouse);
  // bump MUY suave (adiós linterna)
  float bump = exp(-md * md * 12.0) * uHover;
  vec2 bumpVec = (vUv - uMouse) * (-0.14) * bump;

  vec2 d = (n * 0.55 + bumpVec) * uRefract;

  vec2 ca = d * uChroma;

  float r = tapBlur(uvScreen + d + ca).r;
  float g = tapBlur(uvScreen + d).g;
  float b = tapBlur(uvScreen + d - ca).b;

  vec3 col = vec3(r,g,b);

  // “milk” mínimo para feel Apple
  col = mix(col, vec3(1.0), 0.010);

  // spec SUPER leve
  float spec = exp(-md * md * 26.0) * (0.03 * uHover);
  col += spec;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export function LiquidGlass({
    children,
    className = "",
    strength = 0.040,
    blur = 1.10,
    chroma = 0.10,
    captureFps = 0.5,
    ...rest
}: LiquidGlassProps) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const noiseTex = useMemo(() => makeNoiseTexture(128), []);

    useEffect(() => {
        let alive = true;
        let captureToken = 0;

        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;

        let renderer: THREE.WebGLRenderer | null = null;
        let mat: THREE.ShaderMaterial | null = null;
        let mesh: THREE.Mesh | null = null;

        let raf = 0;
        let capTimer: number | null = null;

        const safe = (fn: () => void) => {
            try { fn(); } catch (e) { console.warn("[LiquidGlass]", e); }
        };

        safe(() => {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                premultipliedAlpha: false,
            });

            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

            mat = new THREE.ShaderMaterial({
                vertexShader: vert,
                fragmentShader: frag,
                transparent: true,
                uniforms: {
                    uScene: { value: new THREE.Texture() },
                    uNoise: { value: noiseTex },
                    uViewport: { value: new THREE.Vector2(1, 1) },
                    uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                    uTime: { value: 0 },
                    uRefract: { value: strength },
                    uBlur: { value: blur },
                    uChroma: { value: chroma },
                    uHover: { value: 0 },
                },
            });

            mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
            scene.add(mesh);

            const updateRectAndSize = (captW: number, captH: number) => {
                if (!renderer || !mat || !alive) return;
                const r = wrap.getBoundingClientRect();
                renderer.setSize(Math.max(1, Math.floor(r.width)), Math.max(1, Math.floor(r.height)), false);
                (mat.uniforms.uViewport.value as THREE.Vector2).set(captW, captH);
                (mat.uniforms.uRect.value as THREE.Vector4).set(
                    r.left,
                    captH - (r.top + r.height),
                    r.width,
                    r.height
                );
            };

            const captureStage = async () => {
                const token = ++captureToken;
                try {
                    const stage = document.getElementById("tg-stage");
                    if (!stage || !alive || !mat) return;

                    const shot = await html2canvas(stage as HTMLElement, {
                        backgroundColor: null,
                        logging: false,
                        useCORS: true,
                        scale: 1,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        windowWidth: window.innerWidth,
                        windowHeight: window.innerHeight,
                    });

                    if (!alive || !mat || token !== captureToken) return;

                    const prev = mat.uniforms.uScene.value as THREE.Texture;
                    prev?.dispose?.();

                    const tex = new THREE.CanvasTexture(shot);
                    tex.minFilter = THREE.LinearFilter;
                    tex.magFilter = THREE.LinearFilter;
                    tex.needsUpdate = true;

                    mat.uniforms.uScene.value = tex;
                    updateRectAndSize(shot.width, shot.height);
                } catch (e) {
                    // no tumba la app
                    console.warn("[LiquidGlass capture]", e);
                }
            };

            const handleEnter = () => { if (mat) mat.uniforms.uHover.value = 1; };
            const handleLeave = () => { if (mat) mat.uniforms.uHover.value = 0; };
            const handleMove = (e: PointerEvent) => {
                if (!mat) return;
                const r = wrap.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                (mat.uniforms.uMouse.value as THREE.Vector2).set(
                    Math.max(0.06, Math.min(0.94, x)),
                    Math.max(0.06, Math.min(0.94, y))
                );
            };

            wrap.addEventListener("pointerenter", handleEnter, { passive: true });
            wrap.addEventListener("pointerleave", handleLeave, { passive: true });
            wrap.addEventListener("pointermove", handleMove, { passive: true });

            const onResize = () => { captureStage(); };
            window.addEventListener("resize", onResize, { passive: true });

            const loop = (t: number) => {
                if (!alive || !renderer || !mat) return;
                mat.uniforms.uTime.value = t / 1000;
                renderer.render(scene, camera);
                raf = requestAnimationFrame(loop);
            };

            // captura low-fps
            const interval = Math.max(900, Math.floor(1000 / Math.max(0.5, captureFps)));
            captureStage();
            capTimer = window.setInterval(captureStage, interval);

            raf = requestAnimationFrame(loop);

            // cleanup
            return () => {
                alive = false;
                captureToken++;

                if (capTimer) window.clearInterval(capTimer);
                cancelAnimationFrame(raf);

                window.removeEventListener("resize", onResize);
                wrap.removeEventListener("pointerenter", handleEnter);
                wrap.removeEventListener("pointerleave", handleLeave);
                wrap.removeEventListener("pointermove", handleMove);

                if (renderer) renderer.dispose();
                if (mesh) (mesh.geometry as THREE.BufferGeometry).dispose();
                if (mat) {
                    const tex = mat.uniforms.uScene.value as THREE.Texture | undefined;
                    tex?.dispose?.();
                    mat.dispose();
                }
            };
        });

        return () => {
            alive = false;
            captureToken++;
            if (capTimer) window.clearInterval(capTimer);
            cancelAnimationFrame(raf);
            if (renderer) renderer.dispose();
            if (mesh) (mesh.geometry as THREE.BufferGeometry).dispose();
            if (mat) {
                const tex = mat.uniforms.uScene.value as THREE.Texture | undefined;
                tex?.dispose?.();
                mat.dispose();
            }
        };
    }, [noiseTex, strength, blur, chroma, captureFps]);

    return (
        <div ref={wrapRef} className={`liquid-webgl ${className}`} {...rest}>
            <canvas className="liquid-webgl__canvas" ref={canvasRef} />
            <div className="liquid-webgl__content">{children}</div>
        </div>
    );
}
