import { useAppearance } from "../../components/providers/AppearanceProvider";

export function MinimalistBackdrop() {
    const { theme } = useAppearance();
    const isLight = theme === 'light';

    const baseColor = isLight ? "#ffffff" : "#000000";

    return (
        <div
            className="tg-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                backgroundColor: baseColor,
                backgroundImage: isLight
                    ? "radial-gradient(circle at 50% -20%, #f1f5f9 0%, transparent 80%)"
                    : "radial-gradient(circle at 50% -20%, #0f172a 0%, transparent 80%)",
            }}
        >
            {/* Very subtle line/texture */}
            <div className="absolute inset-0 opacity-[0.02] border-t border-white pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(128,128,128,0.2) 50%, transparent 100%)", height: '1px', top: '20%' }} />
        </div>
    );
}
