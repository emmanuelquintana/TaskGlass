import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Repeat } from 'lucide-react'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import type { BoardTask, BoardTag } from '../../types/board'

export function TaskCard({ task, onClick, isOverlay }: { task: BoardTask, onClick?: (t: BoardTask) => void, isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: { type: 'TASK', task },
        disabled: isOverlay
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
    }

    const containerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (!isDragging && !isOverlay) {
            gsap.from(innerRef.current, {
                y: 10,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out'
            })
        }
    }, [task.id])

    const handleMouseEnter = () => {
        if (!isDragging && innerRef.current && !isOverlay) {
            gsap.to(innerRef.current, {
                scale: 1.05,
                filter: 'brightness(1.1)',
                zIndex: 50,
                duration: 0.3,
                ease: 'power2.out'
            })
        }
    }

    const handleMouseLeave = () => {
        if (!isDragging && innerRef.current && !isOverlay) {
            gsap.to(innerRef.current, {
                scale: 1,
                filter: 'brightness(1)',
                zIndex: 1,
                duration: 0.3,
                ease: 'power2.out'
            })
        }
    }

    const getPriorityColor = (p: number) => {
        if (p >= 10) return 'text-red-400'
        if (p >= 5) return 'text-yellow-400'
        return 'text-blue-400'
    }

    if (isOverlay) {
        return (
            <div className="tg-liquid tg-grain tg-interactive rounded-xl p-3 border border-white/20 cursor-grabbing relative overflow-hidden shadow-2xl scale-105 rotate-2">
                <div className="space-y-3 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="font-medium text-sm leading-snug line-clamp-2 text-white/90">
                            {task.title}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-2">
            <div
                ref={containerRef}
                className="w-full"
            >
                <div
                    ref={innerRef}
                    onClick={() => onClick?.(task)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="tg-liquid tg-grain tg-interactive rounded-xl p-3 border border-white/5 cursor-grab active:cursor-grabbing relative overflow-hidden"
                >
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="font-medium text-sm leading-snug line-clamp-2 text-white/90">
                                {task.title}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/40 font-medium">
                            <div className="flex items-center gap-2">
                                <span className={`${getPriorityColor(task.priority || 4)} flex items-center gap-1`}>
                                    P{task.priority || 4}
                                </span>
                                {(task as any).points && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded ml-1 text-white/60">
                                        {(task as any).points} pts
                                    </span>
                                )}
                                {task.templateId && <Repeat className="w-3 h-3 text-blue-300" />}
                            </div>
                        </div>

                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {task.tags.map((tag: BoardTag) => (
                                    <span
                                        key={tag.id}
                                        className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold border"
                                        style={{
                                            borderColor: tag.color || '#666',
                                            color: tag.color || '#666',
                                            backgroundColor: `${tag.color || '#666'}10`
                                        }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
