import { useAppearance } from "../../components/providers/AppearanceProvider";
import { LiquidBackdrop } from "./LiquidBackdrop";
import { GeometricBackdrop } from "./GeometricBackdrop";
import { MeshBackdrop } from "./MeshBackdrop";

export function AppBackground() {
    const { bgMode } = useAppearance();

    switch (bgMode) {
        case 'geometric':
            return <GeometricBackdrop />;
        case 'mesh':
            return <MeshBackdrop />;
        case 'liquid':
        default:
            return <LiquidBackdrop />;
    }
}
