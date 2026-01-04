import { useAppearance } from "../../components/providers/AppearanceProvider";

export function ZenBackdrop() {
    const { theme } = useAppearance();
    const isLight = theme === 'light';

    const baseColor = isLight ? "#f5f3ff" : "#0f0e17";

    // Gradient mesh that feels calm
    const bg = isLight
        ? "radial-gradient(at 10% 10%, rgba(167, 139, 250, 0.2) 0px, transparent 50%), radial-gradient(at 90% 10%, rgba(192, 132, 252, 0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(221, 214, 254, 0.2) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(124, 58, 237, 0.1) 0px, transparent 50%)"
        : "radial-gradient(at 10% 10%, rgba(88, 28, 135, 0.3) 0px, transparent 50%), radial-gradient(at 90% 10%, rgba(76, 29, 149, 0.2) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(30, 27, 75, 0.4) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(46, 16, 101, 0.2) 0px, transparent 50%)";

    return (
        <div
            className="tg-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                backgroundColor: baseColor,
                backgroundImage: bg,
                filter: 'saturate(80%)'
            }}
        >
            {/* Grain effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
    );
}
