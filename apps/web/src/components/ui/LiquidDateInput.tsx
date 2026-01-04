import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface LiquidDateInputProps {
    value: string
    onChange: (date: string) => void
    label?: string
}

export function LiquidDateInput({ value, onChange, label }: LiquidDateInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            // Prefer showing below unless very tight space (< 280px)
            const showAbove = spaceBelow < 280

            setCoords({
                top: showAbove ? rect.top - 330 : rect.bottom + 8,
                left: rect.left
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

    const currentDate = value ? new Date(value + 'T12:00:00') : new Date()
    const [viewDate, setViewDate] = useState(currentDate)

    useEffect(() => {
        if (isOpen && value) {
            setViewDate(new Date(value + 'T12:00:00'))
        }
    }, [isOpen, value])

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sun

    const handleDayClick = (day: number) => {
        const mm = String(month + 1).padStart(2, '0')
        const dd = String(day).padStart(2, '0')
        onChange(`${year}-${mm}-${dd}`)
        setIsOpen(false)
    }

    const changeMonth = (delta: number) => {
        setViewDate(new Date(year, month + delta, 1))
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="text-xs tg-muted mb-1 block">{label}</label>}
            <button
                type="button"
                onClick={toggleOpen}
                className="flex w-full items-center gap-2 tg-liquid tg-grain tg-interactive px-3 py-2 rounded-xl text-sm min-w-[140px] justify-between group hover:border-white/20 transition-all font-medium"
            >
                <span>{value || 'Pick a date'}</span>
                <svg className={`w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="fixed w-[280px] tg-liquid tg-grain rounded-3xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl"
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={() => changeMonth(-1)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="font-semibold text-sm">{monthNames[month]} {year}</span>
                            <button type="button" onClick={() => changeMonth(1)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 text-center gap-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-[10px] uppercase font-bold text-white/30 h-8 flex items-center justify-center">{d}</div>
                            ))}

                            {/* Empties */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`emp-${i}`} />
                            ))}

                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const d = i + 1
                                const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                                const isToday = new Date().toDateString() === new Date(year, month, d).toDateString()

                                return (
                                    <button
                                        type="button"
                                        key={d}
                                        onClick={() => handleDayClick(d)}
                                        className={`
                                            h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all duration-200
                                            ${isSelected
                                                ? 'bg-white text-black font-bold shadow-lg shadow-white/20'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'}
                                            ${!isSelected && isToday ? 'border border-white/20 text-blue-300' : ''}
                                        `}
                                    >
                                        {d}
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
