import { useCallback, useRef } from "react";

export function useLiquidPointer<T extends HTMLElement>() {
    const nodeRef = useRef<T | null>(null);

    const onMove = useCallback((ev: PointerEvent) => {
        const el = ev.currentTarget as HTMLElement;
        const r = el.getBoundingClientRect();

        const x = ((ev.clientX - r.left) / r.width) * 100;
        const y = ((ev.clientY - r.top) / r.height) * 100;

        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
    }, []);

    const onLeave = useCallback((ev: PointerEvent) => {
        const el = ev.currentTarget as HTMLElement;
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
    }, []);

    const setRef = useCallback(
        (node: T | null) => {
            // detach
            if (nodeRef.current) {
                nodeRef.current.removeEventListener("pointermove", onMove);
                nodeRef.current.removeEventListener("pointerleave", onLeave);
            }

            nodeRef.current = node;

            // attach
            if (node) {
                node.addEventListener("pointermove", onMove, { passive: true });
                node.addEventListener("pointerleave", onLeave, { passive: true });
            }
        },
        [onMove, onLeave]
    );

    return setRef;
}
