import React, { useRef } from "react";

type LiquidProps = React.HTMLAttributes<HTMLDivElement> & {
    follow?: boolean; // default true
};

export function Liquid({ follow = true, className = "", ...props }: LiquidProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    function setVars(e: React.PointerEvent) {
        if (!follow) return;
        const el = ref.current;
        if (!el) return;

        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;

        // clamp para evitar “hotspot” pegado a esquinas
        const cx = Math.max(6, Math.min(94, x));
        const cy = Math.max(6, Math.min(94, y));

        el.style.setProperty("--mx", `${cx}%`);
        el.style.setProperty("--my", `${cy}%`);
        el.style.setProperty("--hf", "1");
    }

    function clearVars() {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--hf", "0");
    }

    return (
        <div
            ref={ref}
            onPointerEnter={setVars}
            onPointerMove={setVars}
            onPointerLeave={clearVars}
            className={`tg-liquid tg-grain tg-interactive ${className}`}
            {...props}
        />
    );
}
