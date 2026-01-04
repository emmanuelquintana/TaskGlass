import React, { createContext, useContext, useMemo, useState } from 'react'

type UserProfile = {
    name: string
    username: string
}

type UserContextValue = {
    profile: UserProfile
    updateProfile: (p: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextValue | null>(null)

const STORAGE_KEY = 'tg_user_profile'

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                // error parsing
            }
        }
        return {
            name: 'Emmanuel Quintana',
            username: '@emmanuel'
        }
    })

    const updateProfile = (update: Partial<UserProfile>) => {
        setProfile(prev => {
            const next = { ...prev, ...update }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    const value = useMemo(() => ({
        profile,
        updateProfile
    }), [profile])

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUser must be used within UserProvider')
    return ctx
}
