import { useEffect, useRef } from "react";

type Props = {
    fps?: number;     // 24–40 recomendado
    scale?: number;   // 0.45–0.7 recomendado (más bajo = más rápido)
};

function isLightTheme() {
    return !document.documentElement.classList.contains("dark");
}

export function AnimatedBackdrop({ fps = 30, scale = 0.6 }: Props) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

        let raf = 0;
        let last = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.floor(window.innerWidth * dpr * scale);
            const h = Math.floor(window.innerHeight * dpr * scale);
            canvas.width = Math.max(2, w);
            canvas.height = Math.max(2, h);
        };

        const draw = (t: number) => {
            const targetDelta = 1000 / Math.max(1, fps);
            if (!reduce && t - last < targetDelta) {
                raf = requestAnimationFrame(draw);
                return;
            }
            last = t;

            const w = canvas.width;
            const h = canvas.height;
            const time = t * 0.001;

            ctx.clearRect(0, 0, w, h);

            // base negra o blanca sutil
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = isLightTheme() ? "#f0f4f8" : "rgba(3,6,14,1)";
            ctx.fillRect(0, 0, w, h);

            // “luces” (paletas) - Light Mode ahora más VIBRANTE
            const palDark = ["#1b3bff", "#00c2ff", "#00ffb3", "#7c3aed", "#0ea5e9"];
            const palLight = ["#4f46e5", "#06b6d4", "#10b981", "#8b5cf6", "#3b82f6"]; // Indigo, Cyan, Emerald, Violet, Blue
            const pal = isLightTheme() ? palLight : palDark;

            // screen/lighter para look “iOS” en Dark, Multiply para “acuarela” en Light
            ctx.globalCompositeOperation = isLightTheme() ? "multiply" : "screen";

            const blobs = [
                { a: 0.90, r: 0.55, sx: 0.18, sy: 0.22, kx: 0.9, ky: 0.8, c: pal[0] },
                { a: 0.70, r: 0.48, sx: 0.78, sy: 0.25, kx: 1.1, ky: 0.7, c: pal[1] },
                { a: 0.70, r: 0.60, sx: 0.55, sy: 0.85, kx: 0.8, ky: 1.0, c: pal[2] },
                { a: 0.55, r: 0.52, sx: 0.32, sy: 0.70, kx: 1.3, ky: 1.2, c: pal[3] },
                { a: 0.50, r: 0.44, sx: 0.86, sy: 0.72, kx: 1.0, ky: 1.4, c: pal[4] },
            ];

            for (let i = 0; i < blobs.length; i++) {
                const b = blobs[i];
                const x = (b.sx + 0.10 * Math.sin(time * b.kx + i)) * w;
                const y = (b.sy + 0.10 * Math.cos(time * b.ky + i * 1.7)) * h;
                const rad = (Math.min(w, h) * b.r);

                const g = ctx.createRadialGradient(x, y, rad * 0.05, x, y, rad);
                g.addColorStop(0.0, hexToRgba(b.c, b.a));
                g.addColorStop(0.55, hexToRgba(b.c, b.a * 0.35));
                g.addColorStop(1.0, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, Math.PI * 2);
                ctx.fill();
            }

            // viñeta leve
            ctx.globalCompositeOperation = "source-over";
            const vg = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.75);
            vg.addColorStop(0, "rgba(0,0,0,0)");
            vg.addColorStop(1, isLightTheme() ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.22)");
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, w, h);

            raf = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });

        raf = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [fps, scale]);

    return <canvas id="tg-backdrop" ref={ref} className="tg-backdrop" aria-hidden="true" />;
}

function hexToRgba(hex: string, a: number) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
}
