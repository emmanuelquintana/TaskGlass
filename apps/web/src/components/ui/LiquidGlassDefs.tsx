import { useAppearance } from '../providers/AppearanceProvider';

export function LiquidGlassDefs() {
    const { intensity } = useAppearance();

    // Map intensity (0.0 - 1.5) to filter parameters
    // Default intensity 0.8 -> scale ~100, blur ~1.2
    const scale = 120 * intensity;
    const blur = 1.5 * intensity;

    const scaleStrong = 160 * intensity;
    const blurStrong = 2.0 * intensity;

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
                        scale={scale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    {/* suavizado fuerte para efecto de lente */}
                    <feGaussianBlur stdDeviation={blur} />
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
                        scale={scaleStrong}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />

                    <feGaussianBlur stdDeviation={blurStrong} />
                </filter>
            </defs>
        </svg>
    );
}
