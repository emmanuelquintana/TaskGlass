import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
    theme: Theme
    setTheme: (t: Theme) => void
    toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'tg_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
        if (saved === 'light' || saved === 'dark') return saved
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
        return prefersDark ? 'dark' : 'light'
    })

    const setTheme = (t: Theme) => setThemeState(t)
    const toggle = () => setThemeState((p) => (p === 'dark' ? 'light' : 'dark'))

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme)
        const root = document.documentElement
        if (theme === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
    }, [theme])

    const value = useMemo(() => ({ theme, setTheme, toggle }), [theme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
