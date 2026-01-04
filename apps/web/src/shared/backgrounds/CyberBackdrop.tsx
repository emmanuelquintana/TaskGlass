import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function CyberBackdrop() {
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
            time += 0.01;

            ctx.clearRect(0, 0, w, h);

            // Base
            ctx.fillStyle = isLight ? "#f8fafc" : "#02040a";
            ctx.fillRect(0, 0, w, h);

            // Grid
            const gridSize = 60;
            ctx.strokeStyle = isLight ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.03)";
            ctx.lineWidth = 1;

            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Tech lines
            ctx.strokeStyle = isLight ? "rgba(37, 99, 235, 0.15)" : "rgba(0, 243, 255, 0.15)";
            ctx.lineWidth = 2;

            for (let i = 0; i < 5; i++) {
                const x = (time * 100 + i * 300) % (w + 400) - 200;
                const y = (Math.sin(i + time * 0.5) * 200) + h / 2;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 150, y);
                ctx.stroke();

                // Dot at start
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Glows
            const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
            if (isLight) {
                gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)");
                gradient.addColorStop(1, "rgba(248, 250, 252, 0)");
            } else {
                gradient.addColorStop(0, "rgba(0, 102, 255, 0.1)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

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
            }}
        />
    );
}
