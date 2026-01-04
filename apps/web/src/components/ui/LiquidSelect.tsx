import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
    label: string
    value: string | number
    className?: string
}

interface LiquidSelectProps {
    value: string | number
    onChange: (value: string | number) => void
    options: SelectOption[]
    placeholder?: string
    label?: string
    className?: string
}

export function LiquidSelect({ value, onChange, options, placeholder = 'Select...', label, className }: LiquidSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const showAbove = spaceBelow < 300 // Threshold for flipping

            setCoords({
                top: showAbove ? rect.top - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            })
        }
    }

    const toggleOpen = () => {
        if (!isOpen) {
            updatePosition()
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        if (!isOpen) return
        const handleScroll = () => setIsOpen(false)
        window.addEventListener('scroll', handleScroll, { capture: true })
        window.addEventListener('resize', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true })
            window.removeEventListener('resize', handleScroll)
        }
    }, [isOpen])

    const selectedOption = options.find(o => String(o.value) === String(value))

    return (
        <div className={`relative w-full ${className || ''}`} ref={containerRef}>
            {label && <label className="text-xs tg-muted mb-1 block">{label}</label>}

            <button
                type="button"
                onClick={toggleOpen}
                className="flex w-full items-center justify-between gap-2 tg-liquid tg-grain tg-interactive px-3 py-2.5 rounded-xl text-sm transition-all font-medium text-left border border-white/5 hover:border-white/20"
            >
                <span className={selectedOption ? 'text-white/90' : 'text-white/40'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-start justify-start">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className="fixed tg-liquid tg-grain rounded-2xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl flex flex-col overflow-hidden"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            maxHeight: '300px'
                        }}
                    >
                        <div className="overflow-y-auto tg-scrollbar flex flex-col gap-0.5 p-0.5">
                            {options.map((opt) => {
                                const isSelected = String(opt.value) === String(value)
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value)
                                            setIsOpen(false)
                                        }}
                                        className={`
                                        w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex-shrink-0
                                        ${isSelected
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'}
                                        ${opt.className || ''}
                                    `}
                                    >
                                        {opt.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
