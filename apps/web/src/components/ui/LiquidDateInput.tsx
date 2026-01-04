import { useState, useRef, useEffect } from 'react'

interface LiquidDateInputProps {
    value: string
    onChange: (date: string) => void
    label?: string
}

export function LiquidDateInput({ value, onChange, label }: LiquidDateInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentDate = value ? new Date(value + 'T12:00:00') : new Date()
    const [viewDate, setViewDate] = useState(currentDate)

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
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 tg-liquid tg-grain tg-interactive px-3 py-2 rounded-xl text-sm min-w-[140px] justify-between group hover:border-white/20 transition-all font-medium"
            >
                <span>{value || 'Pick a date'}</span>
                <svg className={`w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 p-4 w-[280px] tg-liquid tg-grain rounded-3xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="font-semibold text-sm">{monthNames[month]} {year}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
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
            )}
        </div>
    )
}
