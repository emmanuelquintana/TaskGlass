import React, { useEffect, useRef } from "react";

type Props = {
    intensity?: number; // 0.6..1.2
};

export function LiquidBackground({ intensity = 1 }: Props) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        let raf = 0;
        let w = 0, h = 0, dpr = 1;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = Math.floor(window.innerWidth);
            h = Math.floor(window.innerHeight);

            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });

        // blobs estilo “luces”
        const blobs = [
            { cx: 0.18, cy: 0.22, r: 520, c: "rgba(99,102,241,0.55)" },  // indigo
            { cx: 0.78, cy: 0.28, r: 560, c: "rgba(14,165,233,0.50)" },  // sky
            { cx: 0.62, cy: 0.86, r: 620, c: "rgba(16,185,129,0.35)" },  // emerald
            { cx: 0.40, cy: 0.60, r: 680, c: "rgba(59,130,246,0.28)" },  // blue
        ];

        const draw = (tms: number) => {
            const t = tms / 1000;

            // base dark
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#050813";
            ctx.fillRect(0, 0, w, h);

            // soft vignette
            const vg = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.75);
            vg.addColorStop(0, "rgba(5,8,19,0)");
            vg.addColorStop(1, "rgba(5,8,19,0.75)");
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, w, h);

            // moving lights
            ctx.globalCompositeOperation = "screen";

            for (let i = 0; i < blobs.length; i++) {
                const b = blobs[i];
                const dx = Math.sin(t * (0.18 + i * 0.07)) * 0.08;
                const dy = Math.cos(t * (0.16 + i * 0.06)) * 0.09;

                const x = (b.cx + dx) * w;
                const y = (b.cy + dy) * h;
                const r = b.r * (0.9 + 0.08 * Math.sin(t * 0.5 + i)) * intensity;

                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, b.c);
                g.addColorStop(0.55, "rgba(0,0,0,0)");
                g.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            }

            // subtle color wash
            ctx.globalCompositeOperation = "overlay";
            const wash = ctx.createLinearGradient(0, 0, w, h);
            wash.addColorStop(0, "rgba(99,102,241,0.10)");
            wash.addColorStop(0.5, "rgba(14,165,233,0.06)");
            wash.addColorStop(1, "rgba(16,185,129,0.07)");
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, w, h);

            if (!prefersReduced) raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [intensity]);

    return <canvas ref={ref} className="tg-wallpaper" aria-hidden="true" />;
}
