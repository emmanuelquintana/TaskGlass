import { Settings2, User } from 'lucide-react';
import { useState } from 'react';
import { LiquidSurface } from '../ui/LiquidSurface';
import { SettingsModal } from './SettingsModal';
import { useUser } from '../providers/UserProvider';

export function Topbar() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { profile } = useUser();

    return (
        <div className="shrink-0">
            <LiquidSurface className="rounded-2xl px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold tracking-tight">TaskGlass</div>
                    <div className="text-sm tg-muted">Organiza tu día con estilo</div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Perfil Mini */}
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-sm font-bold text-white/90 leading-tight">{profile.name}</div>
                        <div className="text-[10px] font-mono text-white/50">{profile.username}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Settings2 size={20} />
                            <span className="text-sm font-medium pr-1">Ajustes</span>
                        </button>
                    </div>
                </div>
            </LiquidSurface>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    )
}