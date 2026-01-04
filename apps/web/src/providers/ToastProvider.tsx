import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LiquidToast, type ToastProps } from '../components/ui/LiquidToast'
import { toastService, type ToastOptions } from '../lib/toast-service'

interface ToastContextValue {
    toast: (options: ToastOptions) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const addToast = useCallback((options: ToastOptions) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { ...options, id, onDismiss: dismissToast }])
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // Listen to the external service
    useEffect(() => {
        return toastService.subscribe((options) => {
            addToast(options)
        })
    }, [addToast])

    return (
        <ToastContext.Provider value={{ toast: addToast, dismiss: dismissToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none p-4 w-full max-w-[420px] items-end">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <LiquidToast key={toast.id} {...toast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
