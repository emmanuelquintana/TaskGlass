import { useAppearance } from "../../components/providers/AppearanceProvider";
import { LiquidBackdrop } from "./LiquidBackdrop";
import { GeometricBackdrop } from "./GeometricBackdrop";
import { MeshBackdrop } from "./MeshBackdrop";
import { AuroraBackdrop } from "./AuroraBackdrop";
import { CyberBackdrop } from "./CyberBackdrop";
import { ZenBackdrop } from "./ZenBackdrop";
import { MinimalistBackdrop } from "./MinimalistBackdrop";
import { OrbitBackdrop } from "./OrbitBackdrop";
import { CosmosBackdrop } from "./CosmosBackdrop";
import { SunsetBackdrop } from "./SunsetBackdrop";
import { FrostBackdrop } from "./FrostBackdrop";
import { LavaBackdrop } from "./LavaBackdrop";

export function AppBackground() {
    const { bgMode } = useAppearance();

    switch (bgMode) {
        case 'geometric':
            return <GeometricBackdrop />;
        case 'mesh':
            return <MeshBackdrop />;
        case 'aurora':
            return <AuroraBackdrop />;
        case 'cyber':
            return <CyberBackdrop />;
        case 'zen':
            return <ZenBackdrop />;
        case 'minimalist':
            return <MinimalistBackdrop />;
        case 'orbit':
            return <OrbitBackdrop />;
        case 'cosmos':
            return <CosmosBackdrop />;
        case 'sunset':
            return <SunsetBackdrop />;
        case 'frost':
            return <FrostBackdrop />;
        case 'lava':
            return <LavaBackdrop />;
        case 'liquid':
        default:
            return <LiquidBackdrop />;
    }
}
