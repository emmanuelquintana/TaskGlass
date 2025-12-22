import { useEffect, useRef } from "react";
import { useAppearance } from "../../components/providers/AppearanceProvider";

export function GeometricBackdrop() {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const { theme } = useAppearance();

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isLight = theme === 'light';

        let w = 0, h = 0;
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            draw();
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Base Background
            ctx.fillStyle = isLight ? "#f8fafc" : "#050813";
            ctx.fillRect(0, 0, w, h);

            // Set styles
            const strokeColor = isLight ? "rgba(71, 85, 105, 0.15)" : "rgba(255,255,255,0.08)";

            ctx.lineWidth = 2;
            ctx.strokeStyle = strokeColor;

            // Random Seeded (Simple) - actually lets just draw a fixed pattern or randomish
            // For true static, we should use a seed. Here we just draw once on resize.

            // Grid of shapes
            const gridSize = 120;
            const cols = Math.ceil(w / gridSize);
            const rows = Math.ceil(h / gridSize);

            for (let currR = 0; currR < rows; currR++) {
                for (let currC = 0; currC < cols; currC++) {
                    const cx = currC * gridSize + gridSize / 2;
                    const cy = currR * gridSize + gridSize / 2;

                    // Random offset
                    const ox = (Math.random() - 0.5) * 40;
                    const oy = (Math.random() - 0.5) * 40;

                    const type = Math.floor(Math.random() * 4); // 0: circle, 1: triangle, 2: square, 3: X
                    const size = 10 + Math.random() * 20;

                    ctx.beginPath();
                    const finalX = cx + ox;
                    const finalY = cy + oy;

                    if (type === 0) { // Circle
                        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
                    } else if (type === 1) { // Triangle
                        ctx.moveTo(finalX, finalY - size);
                        ctx.lineTo(finalX + size, finalY + size);
                        ctx.lineTo(finalX - size, finalY + size);
                        ctx.closePath();
                    } else if (type === 2) { // Square
                        ctx.rect(finalX - size, finalY - size, size * 2, size * 2);
                    } else if (type === 3) { // X
                        ctx.moveTo(finalX - size, finalY - size);
                        ctx.lineTo(finalX + size, finalY + size);
                        ctx.moveTo(finalX + size, finalY - size);
                        ctx.lineTo(finalX - size, finalY + size);
                    }
                    ctx.stroke();
                }
            }
        };

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [theme]);

    return <canvas ref={ref} className="tg-backdrop" style={{ zIndex: -3 }} />;
}
