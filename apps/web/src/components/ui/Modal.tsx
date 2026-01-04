import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)

    // 1. Sync isOpen -> shouldRender (Open logic)
    useEffect(() => {
        if (isOpen && !shouldRender) {
            setShouldRender(true)
        }
    }, [isOpen, shouldRender])

    // 2. Handle Animations (runs when isOpen or shouldRender changes)
    useGSAP(() => {
        // If not rendering or refs missing, we can't animate
        if (!shouldRender || !contentRef.current || !backdropRef.current) return

        // Kill any ongoing animations to prevent conflicts
        gsap.killTweensOf([contentRef.current, backdropRef.current])

        if (isOpen) {
            // Enter Animation
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            // Set initial state
            gsap.set(backdropRef.current, { opacity: 0 })
            gsap.set(contentRef.current, { opacity: 0, scale: 0.95, y: 10 })

            tl.to(backdropRef.current, { opacity: 1, duration: 0.3 })
                .to(contentRef.current, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                }, '-=0.2')

        } else {
            // Exit Animation
            const tl = gsap.timeline({
                defaults: { ease: 'power2.in' },
                onComplete: () => setShouldRender(false)
            })

            tl.to(contentRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.3 })
                .to(backdropRef.current, { opacity: 0, duration: 0.3 }, '-=0.2')
        }
    }, { dependencies: [isOpen, shouldRender] })

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!shouldRender) return null

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[50] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className={`relative w-full max-w-lg overflow-hidden tg-liquid tg-grain rounded-3xl shadow-2xl ${className}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/5">
                    <h2 className="text-lg font-semibold text-white/90">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
