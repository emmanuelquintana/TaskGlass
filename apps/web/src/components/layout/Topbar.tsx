import { ThemeToggle } from '../ThemeToggle'
import { LiquidSurface } from '../ui/LiquidSurface'
import { SettingsMenu } from './SettingsMenu'

export function Topbar() {
    return (
        <div className="shrink-0">
            <LiquidSurface className="rounded-2xl px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold tracking-tight">TaskGlass</div>
                    <div className="text-sm tg-muted">Liquid Glass UI</div>
                </div>
                <div className="flex items-center gap-2">
                    <SettingsMenu />
                    <ThemeToggle />
                </div>
            </LiquidSurface>
        </div>
    )
}