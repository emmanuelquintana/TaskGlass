import React from "react";
import { useLiquidPointer } from "../../shared/liquid/useLiquidPointer";

type Props = React.PropsWithChildren<{
    className?: string;
    strong?: boolean;
    interactive?: boolean;
}>;

export function LiquidSurface({
    children,
    className = "",
    strong,
    interactive,
}: Props) {
    const ref = useLiquidPointer<HTMLDivElement>();

    const cls = [
        "tg-liquid tg-grain",
        strong ? "tg-liquid-strong" : "",
        interactive ? "tg-interactive tg-press" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div ref={ref} className={cls}>
            {children}
        </div>
    );
}
