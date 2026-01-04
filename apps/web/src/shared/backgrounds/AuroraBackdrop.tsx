import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function AuroraBackdrop() {
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
            ctx.fillStyle = isLight ? "#f1f5f9" : "#020617";
            ctx.fillRect(0, 0, w, h);

            const colors = isLight
                ? ["rgba(59, 130, 246, 0.25)", "rgba(45, 212, 191, 0.25)", "rgba(139, 92, 246, 0.25)"]
                : ["rgba(67, 56, 202, 0.4)", "rgba(13, 148, 136, 0.4)", "rgba(109, 40, 217, 0.4)"];

            ctx.globalCompositeOperation = isLight ? "multiply" : "screen";

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.fillStyle = colors[i];

                const offset = i * Math.PI * 0.6;
                const h1 = Math.sin(time + offset) * 100 + h * 0.4;
                const h2 = Math.cos(time * 0.8 + offset) * 120 + h * 0.6;

                ctx.moveTo(0, h);
                ctx.lineTo(0, h1);

                for (let x = 0; x <= w; x += 50) {
                    const y = Math.sin(x * 0.002 + time + offset) * 80 +
                        Math.cos(x * 0.001 - time * 0.5 + offset) * 40 +
                        ((h1 + h2) / 2);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(w, h1);
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fill();
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
                filter: 'blur(80px) saturate(140%)',
                transform: 'scale(1.1)'
            }}
        />
    );
}
