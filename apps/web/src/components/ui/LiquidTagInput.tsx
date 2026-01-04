import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface LiquidTagInputProps {
    value: string // Comma separated tags format "name:color,name2:color2"
    onChange: (value: string) => void
    placeholder?: string
    label?: string
}

// Predefined nice colors for dark mode
const COLORS = [
    '#9ca3af', // gray-400 (default)
    '#f87171', // red-400
    '#fb923c', // orange-400
    '#facc15', // yellow-400
    '#a3e635', // lime-400
    '#4ade80', // green-400
    '#34d399', // emerald-400
    '#22d3ee', // cyan-400
    '#60a5fa', // blue-400
    '#818cf8', // indigo-400
    '#a78bfa', // violet-400
    '#e879f9', // fuchsia-400
    '#fb7185'  // rose-400
]

const getColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % COLORS.length
    return COLORS[index]
}

export function LiquidTagInput({ value, onChange, placeholder = 'Add tags...', label }: LiquidTagInputProps) {
    const [inputValue, setInputValue] = useState('')

    // Portal/Popover state
    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const tagRefs = useRef<(HTMLSpanElement | null)[]>([])

    // Parse incoming value string "tag:color,tag2:color2"
    const parsedTags = (value || '').split(',').filter(Boolean).map(t => {
        const [text, color] = t.split(':')
        return { text, color: color || getColor(text) }
    })

    const emitChange = (newTags: { text: string, color: string }[]) => {
        onChange(newTags.map(t => `${t.text}:${t.color}`).join(','))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const newText = inputValue.trim()
            if (newText) {
                if (!parsedTags.some(t => t.text === newText)) {
                    const newTagObj = { text: newText, color: getColor(newText) }
                    emitChange([...parsedTags, newTagObj])
                }
                setInputValue('')
            }
        } else if (e.key === 'Backspace' && !inputValue && parsedTags.length > 0) {
            emitChange(parsedTags.slice(0, -1))
        }
    }

    const removeTag = (index: number) => {
        const newTags = [...parsedTags]
        newTags.splice(index, 1)
        emitChange(newTags)
        if (activeTagIndex === index) setActiveTagIndex(null)
    }

    const handleTagClick = (index: number) => {
        const el = tagRefs.current[index]
        if (el) {
            const rect = el.getBoundingClientRect()
            setCoords({
                top: rect.bottom + 8,
                left: rect.left
            })
            setActiveTagIndex(index)
        }
    }

    const setTagColor = (color: string) => {
        if (activeTagIndex === null) return
        const newTags = [...parsedTags]
        newTags[activeTagIndex] = { ...newTags[activeTagIndex], color }
        emitChange(newTags)
        setActiveTagIndex(null)
    }

    // Close on scroll/resize
    useEffect(() => {
        if (activeTagIndex === null) return
        const handleScroll = () => setActiveTagIndex(null)
        window.addEventListener('scroll', handleScroll, { capture: true })
        window.addEventListener('resize', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true })
            window.removeEventListener('resize', handleScroll)
        }
    }, [activeTagIndex])

    return (
        <div className="w-full">
            {label && <label className="text-xs tg-muted mb-1 block">{label}</label>}

            <div className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm focus-within:border-white/20 focus-within:bg-white/10 transition-all flex flex-wrap gap-2 min-h-[46px]">
                {parsedTags.map((tag, i) => {
                    const color = tag.color
                    return (
                        <span
                            key={`${tag.text}-${i}`}
                            ref={el => { tagRefs.current[i] = el }}
                            onClick={() => handleTagClick(i)}
                            className="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border animate-in zoom-in-95 duration-200 cursor-pointer hover:brightness-110 select-none transition-all relative"
                            style={{
                                backgroundColor: `${color}20`,
                                color: color,
                                borderColor: `${color}40`
                            }}
                            title="Click to customize color"
                        >
                            #{tag.text}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeTag(i)
                                }}
                                className="opacity-60 hover:opacity-100 hover:bg-white/10 rounded-full p-0.5 transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )
                })}

                <input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={parsedTags.length === 0 ? placeholder : ''}
                    className="flex-1 bg-transparent outline-none text-white/90 placeholder:text-white/20 min-w-[120px]"
                />
            </div>

            <div className="text-[10px] text-white/30 mt-1 pl-1 flex justify-between">
                <span>Press Enter to add</span>
                <span>Click tag to set color</span>
            </div>

            {/* Color Picker Portal */}
            {activeTagIndex !== null && createPortal(
                <div className="fixed inset-0 z-[100] flex items-start justify-start">
                    <div
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setActiveTagIndex(null)}
                    />

                    <div
                        className="fixed tg-liquid tg-grain rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl grid grid-cols-5 gap-1"
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setTagColor(c)}
                                className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-sm"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
