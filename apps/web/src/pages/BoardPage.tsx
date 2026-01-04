import { useState, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable
} from '@dnd-kit/core'
import type {
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Search, Filter, Pencil, GripVertical, Check, Repeat } from 'lucide-react'
import { useBoard, useUpdateTask, useCreateTask, useUpdateTaskSortOrder, useUpdateColumnSortOrder } from '../api/board.api'
import { TaskPreviewModal } from '../components/board/TaskPreviewModal'
import { CreateTaskModal } from '../components/board/CreateTaskModal'
import { LiquidSelect } from '../components/ui/LiquidSelect'
import { LiquidDateInput } from '../components/ui/LiquidDateInput'
import { useCreateRecurrenceTemplate, useRunDaily } from '../api/recurrence.api'

// Helper for date
const todayYYYYMMDD = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
}

// Draggable Column Component
function SortableColumnItem({ column, children, isLayoutMode }: { column: any, children: React.ReactNode, isLayoutMode: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: { type: 'COLUMN', column },
        disabled: !isLayoutMode
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            // Use w-[300px] and flex-shrink-0 to prevent squeezing
            className={`flex flex-col gap-4 rounded-3xl p-4 transition-all duration-300 w-[300px] flex-shrink-0
                ${isLayoutMode ? 'border-2 border-purple-500/30' : 'border border-transparent'}
                tg-liquid tg-grain tg-interactive hover:brightness-110 group/column`}
        >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {isLayoutMode && (
                        <div {...attributes} {...listeners} className="cursor-grab hover:text-purple-400 text-white/20">
                            <GripVertical className="w-5 h-5" />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color || '#fff' }} />
                        <h3 className="font-semibold text-white/90">{column.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">
                            {column.tasks?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
            {children}
        </div>
    )
}

// Droppable Body for Tasks
function DroppableColumnBody({ columnId, children }: { columnId: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: columnId,
        data: { type: 'COLUMN_BODY', columnId }
    })
    return (
        <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[100px]">
            {children}
        </div>
    )
}

// Sortable Task Component
function SortableTaskItem({ task, onClick }: { task: any, onClick: (t: any) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: { type: 'TASK', task }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
    }

    const containerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (!isDragging) {
            gsap.from(innerRef.current, {
                y: 10,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out'
            })
        }
    }, [task.id])

    const handleMouseEnter = () => {
        if (!isDragging && innerRef.current) {
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
        if (!isDragging && innerRef.current) {
            gsap.to(innerRef.current, {
                scale: 1,
                filter: 'brightness(1)',
                zIndex: 1,
                duration: 0.3,
                ease: 'power2.out'
            })
        }
    }

    // Priority color helper
    const getPriorityColor = (p: number) => {
        if (p >= 10) return 'text-red-400'
        if (p >= 5) return 'text-yellow-400'
        return 'text-blue-400'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-2">
            {/* Wrapper for GSAP to avoid conflict with DnD transform */}
            <div
                ref={containerRef}
                className="w-full"
            >
                <div
                    ref={innerRef}
                    onClick={() => onClick(task)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="tg-liquid tg-grain tg-interactive rounded-xl p-3 border border-white/5 cursor-grab active:cursor-grabbing relative overflow-hidden"
                >
                    {/* Task Content */}
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="font-medium text-sm leading-snug line-clamp-2 text-white/90">
                                {task.title}
                            </div>
                        </div>

                        {/* Meta Row */}
                        <div className="flex items-center justify-between text-[10px] text-white/40 font-medium">
                            <div className="flex items-center gap-2">
                                <span className={`${getPriorityColor(task.priority)} flex items-center gap-1`}>
                                    P{task.priority || 4}
                                </span>
                                {task.points && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded ml-1 text-white/60">
                                        {task.points} pts
                                    </span>
                                )}
                                {task.templateId && <Repeat className="w-3 h-3 text-blue-300" />}
                            </div>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {task.tags.map((tag: any) => (
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

export function BoardPage() {
    const { workspaceId } = useParams()
    console.log('BoardPage Render:', { workspaceId })

    const [runDate, setRunDate] = useState(todayYYYYMMDD())
    const [filterQ, setFilterQ] = useState('')
    const [filterPriorityMin, setFilterPriorityMin] = useState(0)
    const [filterStatuses, setFilterStatuses] = useState<string[]>([])
    const [filterTags, setFilterTags] = useState<string[]>([])

    // Debounce search ideally, but for now direct state is fine for low volume
    const { data: board, isLoading, error } = useBoard(workspaceId ?? '', {
        runDate,
        q: filterQ,
        priorityMin: filterPriorityMin > 0 ? filterPriorityMin : undefined,
        statuses: filterStatuses.length > 0 ? filterStatuses : undefined,
        tagIds: filterTags.length > 0 ? filterTags : undefined
    })

    // Recurrent Filter
    const [filterRecurrentOnly, setFilterRecurrentOnly] = useState(false)

    console.log('useBoard state:', { isLoading, error, boardData: board })

    const createTask = useCreateTask(workspaceId ?? '')
    const updateTask = useUpdateTask(workspaceId ?? '')
    const updateSort = useUpdateTaskSortOrder(workspaceId ?? '')
    const updateColumnSort = useUpdateColumnSortOrder(workspaceId ?? '')

    const [activeId, setActiveId] = useState<string | null>(null)
    const [startColumnId, setStartColumnId] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [targetColumnForCreate, setTargetColumnForCreate] = useState<string>('todo')

    // Layout Mode
    const [isLayoutMode, setIsLayoutMode] = useState(false)

    // Local State for Optimistic UI
    const [columns, setColumns] = useState<any[]>([])

    // Sync board data to local state
    useMemo(() => {
        if (board?.columns) {
            setColumns(board.columns)
        }
    }, [board])

    // Extract unique tags
    const availableTags = useMemo(() => {
        const map = new Map<string, { id: string, name: string, color: string }>()
        columns.forEach(c => {
            c.tasks?.forEach((t: any) => {
                t.tags?.forEach((tag: any) => {
                    if (!map.has(tag.id)) map.set(tag.id, tag)
                })
            })
        })
        return Array.from(map.values())
    }, [columns])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const findColumn = (id: string) => columns.find(c => c.tasks.some((t: any) => t.id === id) || c.id === id || c.key === id)

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(event.active.id as string)

        const col = findColumn(active.id as string)
        if (col) setStartColumnId(col.id)
    }

    const toggleLayoutMode = async () => {
        if (isLayoutMode) {
            // Saving
            await updateColumnSort.mutateAsync(columns.map((c, i) => ({ id: c.id, sortOrder: i + 1 })))
        }
        setIsLayoutMode(!isLayoutMode)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setStartColumnId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string
        const activeType = active.data.current?.type

        // --- COLUMN REORDERING ---
        if (activeType === 'COLUMN') {
            if (activeId !== overId) {
                const oldIndex = columns.findIndex(c => c.id === activeId)
                const newIndex = columns.findIndex(c => c.id === overId)
                if (oldIndex !== -1 && newIndex !== -1) {
                    const newCols = arrayMove(columns, oldIndex, newIndex)
                    setColumns(newCols)
                    // Save deferred to button click
                }
            }
            return
        }

        // --- TASK REORDERING / MOVING ---
        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) return

        const activeColumnId = activeColumn.id
        const activeColumnKey = activeColumn.key

        // If moved to a different column (Status Change)
        if (startColumnId && startColumnId !== activeColumnId) {
            // Status Changed
            await updateTask.mutateAsync({
                id: activeId,
                dto: { status: activeColumnKey }
            })
        }

        // Sorting update
        if (activeColumn) {
            const items = activeColumn.tasks.map((t: any, i: number) => ({ id: t.id, sortOrder: i + 1 }))
            await updateSort.mutateAsync({ workspaceId: workspaceId!, items })
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string
        const activeType = active.data.current?.type

        if (activeType === 'COLUMN') return // Columns handled by SortableContext strategy

        // Find columns
        const findColumn = (id: string) => columns.find(c => c.tasks.some((t: any) => t.id === id) || c.id === id || c.key === id)
        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) return

        if (activeColumn.id !== overColumn.id) {
            setColumns(prev => {
                const activeColIndex = prev.findIndex(c => c.id === activeColumn.id)
                const overColIndex = prev.findIndex(c => c.id === overColumn.id)

                if (activeColIndex === -1 || overColIndex === -1) return prev

                const activeTaskIndex = prev[activeColIndex].tasks.findIndex((t: any) => t.id === activeId)
                if (activeTaskIndex === -1) return prev

                const activeTask = prev[activeColIndex].tasks[activeTaskIndex]

                // Clone
                const newCols = [...prev]
                const newActiveCol = { ...newCols[activeColIndex], tasks: [...newCols[activeColIndex].tasks] }
                const newOverCol = { ...newCols[overColIndex], tasks: [...newCols[overColIndex].tasks] }

                // Remove from active
                newActiveCol.tasks.splice(activeTaskIndex, 1)

                // Add to over
                // If overId is the column itself, add to end (or 0)
                const overTaskIndex = newOverCol.tasks.findIndex((t: any) => t.id === overId)

                let newIndex
                if (overTaskIndex >= 0) {
                    // We are over a task
                    const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : newOverCol.tasks.length + 1;
                } else {
                    // We are over the column container
                    newIndex = newOverCol.tasks.length + 1
                }

                if (isNaN(newIndex)) newIndex = newOverCol.tasks.length

                newOverCol.tasks.splice(newIndex, 0, activeTask) // Insert

                newCols[activeColIndex] = newActiveCol
                newCols[overColIndex] = newOverCol

                return newCols
            })
        }
    }

    const handleCreateTask = async (data: any) => {
        await createTask.mutateAsync({
            ...data,
            workspaceId
        })
    }

    const { mutateAsync: createRecurrence } = useCreateRecurrenceTemplate(workspaceId ?? '')
    const { mutateAsync: runDaily } = useRunDaily(workspaceId ?? '')

    const handleCreateRecurrence = async (data: any) => {
        console.log('Creating recurrence template...', data)
        try {
            await createRecurrence({
                ...data,
                // Map CreateTask fields to Recurrence DTO
                cadence: 'daily',
                isActive: true,
                statusDefault: data.status
            })
            console.log('Recurrence template created. Triggering daily run for:', runDate)

            // Force a run for the current view date so the new task appears immediately
            await runDaily({ runDate })
            console.log('Daily run triggered successfully.')
        } catch (error) {
            console.error('Error creating recurrence or triggering run:', error)
        }
    }

    const [selectedTask, setSelectedTask] = useState<any>(null)

    const openCreateModal = (columnKey: string) => {
        setTargetColumnForCreate(columnKey)
        setIsCreateModalOpen(true)
    }



    // Toggle Helpers
    const toggleStatus = (status: string) => {
        setFilterStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
    }
    const toggleTag = (tagId: string) => {
        setFilterTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId])
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="space-y-4">
                {/* Board Header & Filters */}
                <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-4 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="text-lg font-semibold">Board</div>
                            <div className="text-sm tg-muted">workspace: {workspaceId}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm tg-muted">runDate</label>
                            <div className="w-[180px]">
                                <LiquidDateInput
                                    value={runDate}
                                    onChange={setRunDate}
                                />
                            </div>
                            <button
                                onClick={toggleLayoutMode}
                                className={`p-2 rounded-xl transition-all border ${isLayoutMode ? 'bg-green-500/20 text-green-200 border-green-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                                title={isLayoutMode ? "Save Layout" : "Edit Board Layout"}
                            >
                                {isLayoutMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setFilterRecurrentOnly(!filterRecurrentOnly)}
                                className={`p-2 rounded-xl transition-all border ${filterRecurrentOnly ? 'bg-blue-500/20 text-blue-200 border-blue-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                                title={filterRecurrentOnly ? "Showing Recurrent" : "Filter Recurrent"}
                            >
                                <Repeat className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-white/5">

                        {/* Search */}
                        <div className="relative group w-full md:w-auto md:min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <input
                                value={filterQ}
                                onChange={e => setFilterQ(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:bg-black/30 focus:border-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

                        {/* Priority */}
                        <div className="w-[140px]">
                            <LiquidSelect
                                label=""
                                placeholder="Priority"
                                value={filterPriorityMin}
                                onChange={(v) => setFilterPriorityMin(Number(v))}
                                options={[
                                    { label: 'All Priorities', value: 0 },
                                    { label: 'High Only (P1)', value: 1, className: 'text-red-400' },
                                    { label: 'Medium+ (P2+)', value: 2, className: 'text-yellow-400' },
                                    { label: 'Low+ (P3+)', value: 3, className: 'text-blue-400' }
                                ]}
                            />
                        </div>

                        {/* Status Toggles */}
                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                            {['todo', 'in_progress', 'blocked', 'done'].map(s => {
                                const active = filterStatuses.includes(s)
                                return (
                                    <button
                                        key={s}
                                        onClick={() => toggleStatus(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {s.replace('_', ' ').toUpperCase()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tags Filter Row */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                        {(availableTags.length > 0) && (
                            <div className="flex items-center gap-2 overflow-x-auto tg-scrollbar flex-1 mr-4">
                                <Filter className="w-3 h-3 text-white/30 flex-shrink-0" />
                                {availableTags.map(tag => {
                                    const active = filterTags.includes(tag.id)
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all flex-shrink-0 whitespace-nowrap ${active
                                                ? 'brightness-125 shadow-md bg-white/5'
                                                : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                                }`}
                                            style={{
                                                backgroundColor: active ? `${tag.color || '#666'}30` : `${tag.color || '#666'}20`,
                                                color: tag.color || '#666',
                                                borderColor: active ? tag.color : 'transparent'
                                            }}
                                        >
                                            #{tag.name}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {(filterQ || filterPriorityMin > 0 || filterStatuses.length > 0 || filterTags.length > 0) && (
                            <button
                                onClick={() => {
                                    setFilterQ('')
                                    setFilterPriorityMin(0)
                                    setFilterStatuses([])
                                    setFilterTags([])
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 whitespace-nowrap ml-auto"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {isLoading && <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-6 tg-muted">Cargando board…</div>}
                {error && <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-6">Error cargando board</div>}

                {!isLoading && board && (
                    <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-5 items-start" style={{ minWidth: '100%' }}>
                            {columns.map((c) => {
                                const displayedTasks = c.tasks?.filter((t: any) => {
                                    if (filterRecurrentOnly) return !!t.templateId
                                    return true
                                }) || []

                                return (
                                    <SortableColumnItem key={c.id} column={c} isLayoutMode={isLayoutMode}>
                                        <SortableContext items={displayedTasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                                            <DroppableColumnBody columnId={c.key}>
                                                <div className="space-y-2 flex-1">
                                                    {displayedTasks.map((t: any) => (
                                                        <SortableTaskItem key={t.id} task={t} onClick={(task) => setSelectedTask(task)} />
                                                    ))}
                                                    {displayedTasks.length === 0 && (
                                                        <div className="px-2 py-6 text-sm tg-muted text-center pointer-events-none opacity-50">
                                                            {filterRecurrentOnly ? 'No recurrent tasks' : 'Empty'}
                                                        </div>
                                                    )}
                                                </div>
                                            </DroppableColumnBody>
                                        </SortableContext>
                                        {!isLayoutMode && !filterRecurrentOnly && (
                                            <button
                                                onClick={() => openCreateModal(c.key)}
                                                className="w-full py-2.5 text-sm font-medium text-center text-white/40 border border-white/5 border-dashed rounded-2xl hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all duration-300 mt-2"
                                            >
                                                + Add
                                            </button>
                                        )}
                                    </SortableColumnItem>
                                )
                            })}
                        </div>
                    </SortableContext>
                )}

                <DragOverlay>
                    {activeId ? (
                        <div className="tg-liquid tg-grain tg-interactive rounded-2xl p-3 cursor-grabbing shadow-2xl skew-y-2 scale-105">
                            <div className="text-sm font-semibold">Moving task...</div>
                        </div>
                    ) : null}
                </DragOverlay>

                <TaskPreviewModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                />

                <CreateTaskModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateTask}
                    onRecurrenceSubmit={handleCreateRecurrence}
                    initialStatus={targetColumnForCreate}
                />
            </div>
        </DndContext>
    )
}
