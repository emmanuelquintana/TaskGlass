import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function OrbitBackdrop() {
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
            time += 0.003;

            ctx.clearRect(0, 0, w, h);

            // Base
            ctx.fillStyle = isLight ? "#fdfdff" : "#010208";
            ctx.fillRect(0, 0, w, h);

            const colors = isLight
                ? ["rgba(59, 130, 246, 0.08)", "rgba(16, 185, 129, 0.08)", "rgba(139, 92, 246, 0.08)"]
                : ["rgba(255, 50, 50, 0.15)", "rgba(50, 255, 50, 0.15)", "rgba(50, 50, 255, 0.15)"];

            for (let i = 0; i < 4; i++) {
                const radius = Math.min(w, h) * (0.3 + i * 0.15);
                const angle = time * (1 - i * 0.2);

                const x = w / 2 + Math.cos(angle) * (radius * 0.2);
                const y = h / 2 + Math.sin(angle) * (radius * 0.2);

                const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
                const c = colors[i % colors.length];
                g.addColorStop(0, c);
                g.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Subtle rotation grid
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(time * 0.1);
            ctx.strokeStyle = isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)";
            ctx.beginPath();
            for (let j = 0; j < 8; j++) {
                ctx.rotate(Math.PI / 4);
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.max(w, h), 0);
            }
            ctx.stroke();
            ctx.restore();

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
                filter: 'blur(100px) saturate(120%)'
            }}
        />
    );
}
