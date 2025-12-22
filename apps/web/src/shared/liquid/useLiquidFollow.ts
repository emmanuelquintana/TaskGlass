import { useCallback, useRef } from "react";

type Opts = {
    strength?: number; // 10..24
};

export function useLiquidFollow(opts: Opts = {}) {
    const strength = opts.strength ?? 16;

    const rafRef = useRef<number | null>(null);
    const lastRef = useRef<{
        el: HTMLElement | null;
        x: number;
        y: number;
    }>({ el: null, x: 0.5, y: 0.2 });

    const flush = useCallback(() => {
        rafRef.current = null;
        const { el, x, y } = lastRef.current;
        if (!el) return;

        const mx = Math.max(6, Math.min(94, x * 100));
        const my = Math.max(6, Math.min(94, y * 100));

        // parallax suave (si lo quieres usar luego)
        const dx = (x - 0.5) * strength;
        const dy = (y - 0.5) * strength;

        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
        el.style.setProperty("--dx", `${-dx}px`);
        el.style.setProperty("--dy", `${-dy}px`);
        el.style.setProperty("--hf", "1");
    }, [strength]);

    const setVars = useCallback(
        (e: React.PointerEvent<HTMLElement>) => {
            const el = e.currentTarget as HTMLElement;
            const r = el.getBoundingClientRect();

            const x = (e.clientX - r.left) / Math.max(1, r.width);
            const y = (e.clientY - r.top) / Math.max(1, r.height);

            lastRef.current = { el, x, y };

            if (rafRef.current == null) {
                rafRef.current = requestAnimationFrame(flush);
            }
        },
        [flush]
    );

    const clearVars = useCallback((e: React.PointerEvent<HTMLElement>) => {
        const el = e.currentTarget as HTMLElement;
        el.style.setProperty("--hf", "0");
    }, []);

    return {
        onPointerEnter: setVars,
        onPointerMove: setVars,
        onPointerLeave: clearVars,
    };
}
