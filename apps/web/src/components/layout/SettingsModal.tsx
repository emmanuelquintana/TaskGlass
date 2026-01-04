import { Waves, Box, Grid3X3, Sparkles, Cpu, Wind, Circle, Orbit, Telescope, Sun, Snowflake, Flame, Palette, User } from 'lucide-react';
import { useAppearance } from '../providers/AppearanceProvider';
import { useUser } from '../providers/UserProvider';
import { Modal } from '../ui/Modal';
import { LiquidInput } from '../ui/LiquidInput';
import { LiquidScrollArea } from '../ui/LiquidScrollArea';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { bgMode, setBgMode, intensity, setIntensity, theme, setTheme } = useAppearance();
    const { profile, updateProfile } = useUser();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Ajustes de Sistema"
            className="sm:max-w-2xl"
        >
            <div className="flex flex-col gap-8 py-2">

                {/* Perfil Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <User size={14} />
                        Perfil de Usuario
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-medium ml-1">NOMBRE</label>
                            <LiquidInput
                                value={profile.name}
                                onChange={(e) => updateProfile({ name: e.target.value })}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-medium ml-1">USERNAME</label>
                            <LiquidInput
                                value={profile.username}
                                onChange={(e) => updateProfile({ username: e.target.value })}
                                placeholder="@usuario"
                            />
                        </div>
                    </div>
                </section>

                {/* Apariencia Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <Palette size={14} />
                        Visuales y Estilo
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Theme & Intensity */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 font-medium ml-1 uppercase">Tema Maestro</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 
                                            ${theme === 'light'
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
                                    >
                                        <Sun size={16} /> Claro
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 
                                            ${theme === 'dark'
                                                ? 'bg-white/10 text-white border-white/20 shadow-lg'
                                                : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
                                    >
                                        <Telescope size={16} /> Oscuro
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] text-gray-500 font-medium uppercase">Intensidad de Vidrio</label>
                                    <span className="text-[10px] font-mono text-blue-500 dark:text-blue-400">{(intensity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1.5" step="0.1"
                                    value={intensity}
                                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>

                        {/* Background Selection Grid */}
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 font-medium ml-1 uppercase text-center block">Selección de Fondo</label>
                            <LiquidScrollArea className="h-[220px] rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                                <div className="grid grid-cols-3 gap-2 p-2">
                                    <BgOption active={bgMode === 'liquid'} onClick={() => setBgMode('liquid')} icon={<Waves size={16} />} label="Liquid" />
                                    <BgOption active={bgMode === 'geometric'} onClick={() => setBgMode('geometric')} icon={<Box size={16} />} label="Geo" />
                                    <BgOption active={bgMode === 'mesh'} onClick={() => setBgMode('mesh')} icon={<Grid3X3 size={16} />} label="Mesh" />
                                    <BgOption active={bgMode === 'aurora'} onClick={() => setBgMode('aurora')} icon={<Sparkles size={16} />} label="Aurora" />
                                    <BgOption active={bgMode === 'cyber'} onClick={() => setBgMode('cyber')} icon={<Cpu size={16} />} label="Cyber" />
                                    <BgOption active={bgMode === 'zen'} onClick={() => setBgMode('zen')} icon={<Wind size={16} />} label="Zen" />
                                    <BgOption active={bgMode === 'minimalist'} onClick={() => setBgMode('minimalist')} icon={<Circle size={16} />} label="Minimal" />
                                    <BgOption active={bgMode === 'orbit'} onClick={() => setBgMode('orbit')} icon={<Orbit size={16} />} label="Orbit" />
                                    <BgOption active={bgMode === 'cosmos'} onClick={() => setBgMode('cosmos')} icon={<Telescope size={16} />} label="Cosmos" />
                                    <BgOption active={bgMode === 'sunset'} onClick={() => setBgMode('sunset')} icon={<Sun size={16} />} label="Sunset" />
                                    <BgOption active={bgMode === 'frost'} onClick={() => setBgMode('frost')} icon={<Snowflake size={16} />} label="Frost" />
                                    <BgOption active={bgMode === 'lava'} onClick={() => setBgMode('lava')} icon={<Flame size={16} />} label="Lava" />
                                </div>
                            </LiquidScrollArea>
                        </div>
                    </div>
                </section>
            </div>
        </Modal>
    );
}

function BgOption({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all duration-300
                ${active
                    ? 'border-blue-500/50 bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-[0_4px_12px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'border-transparent bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10 hover:text-gray-700 dark:hover:text-gray-300'}
            `}
        >
            {icon}
            <span className="text-[10px] font-semibold">{label}</span>
        </button>
    );
}
