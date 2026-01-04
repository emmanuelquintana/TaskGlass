import { useAppearance } from "../../components/providers/AppearanceProvider";

export function SunsetBackdrop() {
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
                    ? "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feada6 100%)"
                    : "linear-gradient(135deg, #302b63 0%, #240b36 50%, #0f0c29 100%)",
                opacity: 1
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: isLight
                        ? "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)"
                        : "radial-gradient(circle at 70% 20%, rgba(255,100,50,0.1) 0%, transparent 60%)"
                }}
            />
        </div>
    );
}
