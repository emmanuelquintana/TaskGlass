import { useAppearance } from "../../components/providers/AppearanceProvider";

export function MeshBackdrop() {
    const { theme } = useAppearance();

    // We can just use CSS for this one to be efficient
    const isLight = theme === 'light';

    const bg = isLight
        ? "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.15) 0px, transparent 50%)"
        : "radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 116, 144, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(126, 34, 206, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 24, 93, 0.15) 0px, transparent 50%)";

    const baseColor = isLight ? "#f8fafc" : "#050813";

    return (
        <div
            className="tg-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                backgroundColor: baseColor,
                backgroundImage: bg,
                opacity: 1,
            }}
        />
    );
}
