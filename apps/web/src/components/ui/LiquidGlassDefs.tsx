
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
                        baseFrequency="0.003"
                        numOctaves="1"
                        seed="8"
                        result="noise"
                    >
                        {/* Distorsión lenta y pesada */}
                        <animate attributeName="baseFrequency" dur="25s" values="0.0025;0.0035;0.0025" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="120"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    {/* suavizado fuerte para efecto de lente */}
                    <feGaussianBlur stdDeviation="1.5" />
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
                        baseFrequency="0.004"
                        numOctaves="1"
                        seed="9"
                        result="noise"
                    >
                        <animate attributeName="baseFrequency" dur="18s" values="0.0035;0.0045;0.0035" repeatCount="indefinite" />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="160"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    <feGaussianBlur stdDeviation="2.0" />
                </filter>
            </defs>
        </svg>
    );
}
