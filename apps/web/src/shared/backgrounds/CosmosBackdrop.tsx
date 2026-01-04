import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function CosmosBackdrop() {
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

        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 2,
            speed: 0.0001 + Math.random() * 0.0005
        }));

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
            time += 0.002;

            ctx.clearRect(0, 0, w, h);

            // Base
            ctx.fillStyle = isLight ? "#e2e8f0" : "#02040b";
            ctx.fillRect(0, 0, w, h);

            // Stars
            ctx.fillStyle = isLight ? "#3b82f6" : "#ffffff";
            stars.forEach(s => {
                const x = s.x * w;
                const y = (s.y + time * s.speed * 100) % 1 * h;
                ctx.globalAlpha = isLight ? 0.1 + Math.random() * 0.3 : 0.2 + Math.random() * 0.8;
                ctx.beginPath();
                ctx.arc(x, y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Nebulas
            ctx.globalAlpha = isLight ? 0.2 : 0.4;
            ctx.globalCompositeOperation = isLight ? "multiply" : "screen";
            const hues = [280, 200, 320];
            hues.forEach((hue, i) => {
                const x = w * (0.5 + 0.3 * Math.sin(time * 0.5 + i));
                const y = h * (0.5 + 0.3 * Math.cos(time * 0.3 + i));
                const rad = Math.max(w, h) * 0.6;
                const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
                g.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.15)`);
                g.addColorStop(1, "transparent");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            });

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
