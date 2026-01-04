import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react'

export interface ToastProps {
    id: string
    title?: string
    message: string
    type?: 'success' | 'error' | 'info' | 'warning'
    duration?: number
    onDismiss: (id: string) => void
}

const variants = {
    initial: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } },
}

export const LiquidToast: React.FC<ToastProps> = ({ id, title, message, type = 'info', duration = 5000, onDismiss }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(id)
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [id, duration, onDismiss])

    const styles = {
        success: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-400/20',
            iconColor: 'text-emerald-400',
            textColor: 'text-emerald-50',
            Icon: CheckCircle2
        },
        error: {
            bg: 'bg-rose-500/10',
            border: 'border-rose-400/20',
            iconColor: 'text-rose-400',
            textColor: 'text-rose-50',
            Icon: AlertOctagon
        },
        warning: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-400/20',
            iconColor: 'text-amber-400',
            textColor: 'text-amber-50',
            Icon: AlertTriangle
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-400/20',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-50',
            Icon: Info
        }
    }

    const style = styles[type]
    const Icon = style.Icon

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
                pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-2xl border
                backdrop-blur-xl shadow-2xl relative group
                ${style.bg} ${style.border}
            `}
            style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

            <div className="flex flex-1 items-start gap-4 p-5 relative z-10">
                <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                    {title && <h3 className={`font-medium text-sm mb-1 ${style.textColor}`}>{title}</h3>}
                    <p className="text-sm opacity-90 leading-relaxed text-white/70 font-light">
                        {message}
                    </p>
                </div>

                <button
                    onClick={() => onDismiss(id)}
                    className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-full text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </motion.div>
    )
}
