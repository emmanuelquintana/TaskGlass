import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor, KeyboardSensor, useDroppable, type DragStartEvent, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoard, useCreateTask, useUpdateTask, useUpdateTaskSortOrder } from '../api/board.api'
import { CreateTaskModal } from '../components/board/CreateTaskModal'
import { TaskPreviewModal } from '../components/board/TaskPreviewModal'

import { LiquidDateInput } from '../components/ui/LiquidDateInput'
import { LiquidSelect } from '../components/ui/LiquidSelect'
import { Search, Filter, Calendar } from 'lucide-react'

function todayYYYYMMDD() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export function BoardPage() {
    const { workspaceId } = useParams()
    const [runDate, setRunDate] = useState<string>(() => todayYYYYMMDD())

    const [filterQ, setFilterQ] = useState('')
    const [filterPriorityMin, setFilterPriorityMin] = useState<number>(0)
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

    const createTask = useCreateTask(workspaceId ?? '')
    const updateTask = useUpdateTask(workspaceId ?? '')
    const updateSort = useUpdateTaskSortOrder(workspaceId ?? '')

    const [activeId, setActiveId] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [targetColumnForCreate, setTargetColumnForCreate] = useState<string>('todo')

    const columns = useMemo(() => board?.columns ?? [], [board])

    // Extract unique tags from the current board data for the filter list
    const availableTags = useMemo(() => {
        const map = new Map<string, { id: string, name: string, color: string }>()
        columns.forEach(c => {
            c.tasks.forEach(t => {
                t.tags?.forEach((tag: any) => {
                    if (!map.has(tag.id)) {
                        map.set(tag.id, tag)
                    }
                })
            })
        })
        return Array.from(map.values())
    }, [columns])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Helper to find column and task
        const findColumn = (id: string) => {
            return columns.find(c => c.tasks.some(t => t.id === id) || c.id === id || c.key === id)
        }

        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) return

        // Moving between different columns
        if (activeColumn.key !== overColumn.key) {
            updateTask.mutate({
                id: activeId,
                dto: { status: overColumn.key as any }
            })
            return
        }

        if (activeColumn.key === overColumn.key && overId === activeColumn.key) {
            return
        }

        const activeIndex = activeColumn.tasks.findIndex(t => t.id === activeId)
        const overIndex = activeColumn.tasks.findIndex(t => t.id === overId)

        if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
            const newTasks = arrayMove(activeColumn.tasks, activeIndex, overIndex)
            // Call API to update sort order
            const items = newTasks.map((t, i) => ({ id: t.id, sortOrder: i + 1 }))
            updateSort.mutate({ workspaceId: workspaceId!, items })
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const findColumn = (id: string) => columns.find(c => c.tasks.some(t => t.id === id) || c.id === id || c.key === id)
        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) return
    }

    const handleCreateTask = async (data: any) => {
        await createTask.mutateAsync({
            ...data,
            workspaceId
        })
    }

    const [selectedTask, setSelectedTask] = useState<any>(null)

    const openCreateModal = (columnKey: string) => {
        setTargetColumnForCreate(columnKey)
        setIsCreateModalOpen(true)
    }

    /* Column Droppable Wrapper */
    const DroppableColumn = ({ column, children }: { column: any, children: React.ReactNode }) => {
        const { setNodeRef } = useDroppable({ id: column.key })
        return (
            <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[50px]">
                {children}
            </div>
        )
    }

    /* Minimal UI for draggable item */
    const SortableTask = ({ task, onClick }: { task: any, onClick: (task: any) => void }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } })

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.3 : 1
        }

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => onClick(task)}
                className="tg-liquid tg-grain tg-interactive rounded-2xl p-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform duration-200 group"
            >
                {/* Header & Tags */}
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {task.tags?.map((tag: any) => (
                            <div
                                key={tag.id}
                                className="h-1.5 w-6 rounded-full"
                                style={{ backgroundColor: tag.color || '#ffffff40' }}
                                title={tag.name}
                            />
                        ))}
                    </div>

                    <div className="text-sm font-semibold leading-snug">{task.title}</div>

                    {task.description && (
                        <div className="text-xs tg-muted line-clamp-2 leading-relaxed opacity-70">
                            {task.description}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-2 text-[11px] tg-muted">
                            {task.priority > 0 && (
                                <span className={`font-bold ${task.priority === 1 ? 'text-red-400' :
                                    task.priority === 2 ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>
                                    P{task.priority}
                                </span>
                            )}
                            {task.dueDate && <span>{task.dueDate}</span>}
                        </div>
                        {/* Avatar placeholder or ID */}
                        <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                            TG
                        </div>
                    </div>
                </div>
            </div>
        )
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
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(240px, 1fr))` }}>
                        {columns.map((c) => (
                            <div key={c.key} className="flex flex-col gap-3">
                                <section className="tg-liquid tg-grain tg-interactive rounded-3xl p-3 flex-1 flex flex-col">
                                    <div className="flex items-baseline justify-between px-2 mb-3">
                                        <div className="font-semibold">{c.title}</div>
                                        <div className="text-xs tg-muted">{c.tasks.length}</div>
                                    </div>

                                    <SortableContext items={c.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                        <DroppableColumn column={c}>
                                            <div className="space-y-2 flex-1">
                                                {c.tasks.map((t) => (
                                                    <SortableTask key={t.id} task={t} onClick={(task) => setSelectedTask(task)} />
                                                ))}
                                                {c.tasks.length === 0 && (
                                                    <div className="px-2 py-6 text-sm tg-muted text-center pointer-events-none">Sin tareas</div>
                                                )}
                                            </div>
                                        </DroppableColumn>
                                    </SortableContext>
                                </section>

                                <button
                                    onClick={() => openCreateModal(c.key)}
                                    className="w-full py-2.5 text-sm font-medium text-center text-white/40 border border-white/5 border-dashed rounded-2xl hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                                >
                                    + Add Task
                                </button>
                            </div>
                        ))}
                    </div>
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
                    initialStatus={targetColumnForCreate}
                />
            </div>
        </DndContext>
    )
}
