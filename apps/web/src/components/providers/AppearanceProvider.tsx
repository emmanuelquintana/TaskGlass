import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'
export type BgMode = 'liquid' | 'geometric' | 'mesh'

type AppearanceContextValue = {
    theme: Theme
    bgMode: BgMode
    intensity: number // 0.0 - 1.0
    setTheme: (t: Theme) => void
    setBgMode: (m: BgMode) => void
    setIntensity: (i: number) => void
    toggleTheme: () => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

const STORAGE_KEY = 'tg_appearance'

type StoredState = {
    theme: Theme
    bgMode: BgMode
    intensity: number
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<StoredState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                return {
                    theme: parsed.theme || 'dark',
                    bgMode: parsed.bgMode || 'liquid',
                    intensity: typeof parsed.intensity === 'number' ? parsed.intensity : 0.8
                }
            } catch (e) {
                // error parsing
            }
        }
        // Defaults
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
        return {
            theme: prefersDark ? 'dark' : 'light',
            bgMode: 'liquid',
            intensity: 0.8
        }
    })

    const updateState = (update: Partial<StoredState>) => {
        setState(prev => {
            const next = { ...prev, ...update }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    const setTheme = (theme: Theme) => updateState({ theme })
    const setBgMode = (bgMode: BgMode) => updateState({ bgMode })
    const setIntensity = (intensity: number) => updateState({ intensity })
    const toggleTheme = () => updateState({ theme: state.theme === 'dark' ? 'light' : 'dark' })

    // Apply side effects
    useEffect(() => {
        const root = document.documentElement

        // 1. Theme
        if (state.theme === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')

        // 2. Intensity CSS Variable
        // Map 0-1 to useful ranges
        // Scale opacity: 0.5x to 1.5x of base
        // Scale blur: 0.5x to 1.5x of base
        root.style.setProperty('--lg-intensity', state.intensity.toString())

    }, [state.theme, state.intensity])

    const value = useMemo(() => ({
        ...state,
        setTheme,
        setBgMode,
        setIntensity,
        toggleTheme
    }), [state])

    return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
    const ctx = useContext(AppearanceContext)
    if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider')
    return ctx
}
