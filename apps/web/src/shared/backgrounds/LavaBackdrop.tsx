import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function LavaBackdrop() {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const { theme } = useAppearance();

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isLight = theme === 'light';
        let raf = 0;
        let time = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };

        const draw = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            time += 0.005;

            ctx.clearRect(0, 0, w, h);

            // Base
            ctx.fillStyle = isLight ? "#881337" : "#4c0519";
            ctx.fillRect(0, 0, w, h);

            const colors = isLight
                ? ["rgba(225, 29, 72, 0.4)", "rgba(251, 146, 60, 0.4)", "rgba(190, 18, 60, 0.4)"]
                : ["rgba(159, 18, 57, 0.6)", "rgba(244, 63, 94, 0.4)", "rgba(136, 19, 55, 0.6)"];

            for (let i = 0; i < 3; i++) {
                const x = w * (0.5 + 0.3 * Math.sin(time * 0.4 + i * 2));
                const y = h * (0.5 + 0.3 * Math.cos(time * 0.3 + i * 1.5));
                const rad = Math.max(w, h) * 0.5;
                const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
                g.addColorStop(0, colors[i]);
                g.addColorStop(1, "transparent");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [theme]);

    return (
        <canvas
            ref={ref}
            className="tg-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                filter: 'blur(100px) saturate(150%) contrast(110%)'
            }}
        />
    );
}
