import React, { useRef } from 'react'
import { useButtonHover } from '../../hooks/useAnimations'

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'icon'
    isActive?: boolean
}

export function LiquidButton({ className, variant = 'primary', isActive, children, ...props }: LiquidButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    useButtonHover(ref)

    let baseClass = "relative overflow-hidden transition-colors duration-200"

    // Style variants
    if (variant === 'primary') {
        baseClass += " bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10"
    } else if (variant === 'ghost') {
        baseClass += " text-white/60 hover:text-white rounded-lg hover:bg-white/5"
    } else if (variant === 'icon') {
        baseClass += " p-2 rounded-xl border"
        if (isActive) {
            baseClass += " bg-green-500/20 text-green-200 border-green-500/50"
        } else {
            baseClass += " bg-white/10 text-white border-white/10"
        }
    }

    return (
        <button
            ref={ref}
            className={`${baseClass} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    )
}
