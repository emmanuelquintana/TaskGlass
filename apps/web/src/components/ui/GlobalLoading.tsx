import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function GlobalLoading() {
    const isFetching = useIsFetching()
    const isMutating = useIsMutating()
    const [visible, setVisible] = useState(false)

    // Small delay to prevent flickering on fast requests
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        if (isFetching > 0 || isMutating > 0) {
            timer = setTimeout(() => setVisible(true), 200)
        } else {
            setVisible(false)
        }
        return () => clearTimeout(timer)
    }, [isFetching, isMutating])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
            <div className="relative flex items-center justify-center">
                {/* Outer rotating ring */}
                <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-white shadow-xl backdrop-blur-md"></div>

                {/* Inner pulsing liquid blob */}
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/30 backdrop-blur-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            </div>
        </div>
    )
}
