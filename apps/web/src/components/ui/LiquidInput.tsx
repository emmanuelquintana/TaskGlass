
import React from 'react'

interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export function LiquidInput({ label, className = '', ...props }: LiquidInputProps) {
    return (
        <div className="w-full">
            {label && <label className="text-xs tg-muted mb-1 block">{label}</label>}
            <input
                {...props}
                className={`w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all ${className}`}
            />
        </div>
    )
}

interface LiquidTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
}

export function LiquidTextArea({ label, className = '', ...props }: LiquidTextAreaProps) {
    return (
        <div className="w-full">
            {label && <label className="text-xs tg-muted mb-1 block">{label}</label>}
            <textarea
                {...props}
                className={`w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all resize-none ${className}`}
            />
        </div>
    )
}
