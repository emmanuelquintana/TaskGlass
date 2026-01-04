import { useAppearance } from "../../components/providers/AppearanceProvider";

export function FrostBackdrop() {
    const { theme } = useAppearance();
    const isLight = theme === 'light';

    return (
        <div
            className="tg-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                background: isLight
                    ? "linear-gradient(to bottom, #e0f2fe, #f8fafc)"
                    : "linear-gradient(to bottom, #0c1a30, #020617)",
            }}
        >
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)"
                }}
            />
        </div>
    );
}
