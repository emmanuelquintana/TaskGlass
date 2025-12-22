import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'

export function ThemeToggle() {
    const { theme, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            className="tg-liquid tg-grain tg-interactive rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90 transition"
            type="button"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
    )
}
