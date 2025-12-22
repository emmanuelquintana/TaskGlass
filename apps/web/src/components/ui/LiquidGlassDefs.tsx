// src/components/ui/LiquidGlassDefs.tsx
import React from "react";

export function LiquidGlassDefs() {
    return (
        <svg width="0" height="0" style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
            <defs>
                {/* Standard: sutil pero evidente */}
                <filter
                    id="tg-liquid-glass-distort"
                    x="-35%" y="-35%" width="170%" height="170%"
                    colorInterpolationFilters="sRGB"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.010"
                        numOctaves="2"
                        seed="8"
                        result="noise"
                    >
                        {/* micro movimiento, MUY lento (no mata rendimiento) */}
                        <animate attributeName="baseFrequency" dur="18s" values="0.009;0.011;0.009" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="18"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    {/* suaviza artefactos */}
                    <feGaussianBlur stdDeviation="0.15" />
                </filter>

                {/* Strong: hover/active más “liquid” */}
                <filter
                    id="tg-liquid-glass-distort-strong"
                    x="-45%" y="-45%" width="190%" height="190%"
                    colorInterpolationFilters="sRGB"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012"
                        numOctaves="2"
                        seed="9"
                        result="noise"
                    >
                        <animate attributeName="baseFrequency" dur="14s" values="0.011;0.013;0.011" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="28"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    <feGaussianBlur stdDeviation="0.18" />
                </filter>
            </defs>
        </svg>
    );
}
