// src/components/ui/LiquidGlassDefs.tsx
import React from "react";

export function LiquidGlassDefs() {
    return (
        <svg width="0" height="0" style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
            <defs>
                {/* Standard: sutil pero evidente */}
                {/* Standard: sutil pero evidente */}
                <filter
                    id="tg-liquid-glass-distort"
                    x="-35%" y="-35%" width="170%" height="170%"
                    colorInterpolationFilters="sRGB"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.006"
                        numOctaves="2"
                        seed="8"
                        result="noise"
                    >
                        {/* micro movimiento lento */}
                        <animate attributeName="baseFrequency" dur="24s" values="0.0055;0.0065;0.0055" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="60"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    {/* suaviza el ruido para que parezca líquido, no granulado */}
                    <feGaussianBlur stdDeviation="0.5" />
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
                        baseFrequency="0.008"
                        numOctaves="2"
                        seed="9"
                        result="noise"
                    >
                        <animate attributeName="baseFrequency" dur="18s" values="0.0075;0.0085;0.0075" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="80"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    <feGaussianBlur stdDeviation="0.8" />
                </filter>
            </defs>
        </svg>
    );
}
