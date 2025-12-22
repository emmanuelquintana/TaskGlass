import { motion } from "framer-motion";
import React from "react";
import { LiquidSurface } from "./LiquidSurface";

type Props = React.PropsWithChildren<{
    className?: string;
    strong?: boolean;
}>;

export function LiquidMotion({ children, className = "", strong }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.7 }}
            style={{ willChange: "transform" }}
        >
            <LiquidSurface strong={strong} interactive className={className}>
                {children}
            </LiquidSurface>
        </motion.div>
    );
}
