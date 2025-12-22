import { Moon, Sun } from 'lucide-react'
import { useAppearance } from './providers/AppearanceProvider'

export function ThemeToggle() {
    const { theme, toggleTheme } = useAppearance()

    return (
        <button
            onClick={toggleTheme}
            className="tg-liquid tg-grain tg-interactive rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90 transition"
            type="button"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
    )
}
