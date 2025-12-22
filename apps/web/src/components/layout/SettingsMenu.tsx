import { Settings2, Waves, Box, Grid3X3, Monitor, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppearance, BgMode } from '../providers/AppearanceProvider';

export function SettingsMenu() {
    const { bgMode, setBgMode, intensity, setIntensity, theme, setTheme } = useAppearance();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);



    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-xl transition-all duration-200
                    ${isOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
                aria-label="Appearance settings"
            >
                <Settings2 size={20} />
            </button>

            {isOpen && (
                <PortalMenu onClose={() => setIsOpen(false)} anchorRef={ref} theme={theme}>
                    <div className="tg-liquid tg-glass p-4 rounded-2xl flex flex-col gap-6 w-72" style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)' }}>


                        {/* 2. Backgrounds */}
                        <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Background</div>
                            <div className="grid grid-cols-3 gap-2">
                                <BgOption
                                    active={bgMode === 'liquid'}
                                    onClick={() => setBgMode('liquid')}
                                    icon={<Waves size={18} />}
                                    label="Liquid"
                                />
                                <BgOption
                                    active={bgMode === 'geometric'}
                                    onClick={() => setBgMode('geometric')}
                                    icon={<Box size={18} />}
                                    label="Geo"
                                />
                                <BgOption
                                    active={bgMode === 'mesh'}
                                    onClick={() => setBgMode('mesh')}
                                    icon={<Grid3X3 size={18} />}
                                    label="Mesh"
                                />
                            </div>
                        </div>

                        {/* 3. Intensity */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Glass Intensity</div>
                                <div className="text-xs font-mono text-gray-500">{(intensity * 100).toFixed(0)}%</div>
                            </div>
                            <input
                                type="range"
                                min="0" max="1.5" step="0.1"
                                value={intensity}
                                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-700/50 rounded-full appearance-none cursor-pointer accent-white"
                            />
                        </div>

                    </div>
                </PortalMenu>
            )}
        </div>
    );
}

function PortalMenu({ children, onClose, anchorRef, theme }: { children: React.ReactNode, onClose: () => void, anchorRef: React.RefObject<HTMLDivElement>, theme: string }) {

    // Calculate Position
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            // Position: Top-Right aligned
            setStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left: (rect.right - 288), // 288 is w-72 (18rem * 16)
                zIndex: 9999,
            });
        }

        // Handle Global Class for Dark Mode inside Portal
        // (Since Portal is at body root, it might lose .dark context if inside a container, 
        //  but .dark is usually on html/body so it should be fine. 
        //  BUT if we had scoped themes, we'd need to add class here. 
        //  Our theme logic puts .dark on HTML, so we are good.)

    }, [anchorRef]);

    // Click Outside listener
    useEffect(() => {
        const handleDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking trigger or inside menu
            if (
                anchorRef.current?.contains(target) ||
                target.closest('[data-portal-menu]')
            ) {
                return;
            }
            onClose();
        };
        window.addEventListener('mousedown', handleDown);
        return () => window.removeEventListener('mousedown', handleDown);
    }, [onClose, anchorRef]);

    return createPortal(
        <div data-portal-menu style={style} className="animate-in fade-in zoom-in-95 duration-100">
            {children}
        </div>,
        document.body
    );
}

function BgOption({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200
                ${active
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-white/5 bg-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10 hover:text-gray-300'}
            `}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
