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
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Search, Filter, Pencil, Check, Repeat, Plus } from 'lucide-react'
import {
    useBoard,
    useUpdateTask,
    useCreateTask,
    useUpdateTaskSortOrder,
    useUpdateColumnSortOrdersBatch
} from '../api/board.api'
import { TaskPreviewModal } from '../components/board/TaskPreviewModal'
import { CreateTaskModal } from '../components/board/CreateTaskModal'
import { CreateColumnModal } from '../components/board/CreateColumnModal'
import { LiquidSelect } from '../components/ui/LiquidSelect'
import { LiquidDateInput } from '../components/ui/LiquidDateInput'
import { LiquidSurface } from '../components/ui/LiquidSurface'
import { useCreateRecurrenceTemplate, useRunDaily } from '../api/recurrence.api'
import { createPortal } from 'react-dom'
import { BoardColumn } from '../components/board/BoardColumn'
import { TaskCard } from '../components/board/TaskCard'
import { DroppableColumnBody } from '../components/board/DroppableColumnBody'
// Helper for date
const todayYYYYMMDD = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
}

export function BoardPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>()

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const filtersRef = useRef<HTMLDivElement>(null)
    const tagsRef = useRef<HTMLDivElement>(null)

    // Global Animations
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        gsap.set([headerRef.current, filtersRef.current], { opacity: 0, y: -20 })
        gsap.set(tagsRef.current, { opacity: 0, y: 10 })

        if (headerRef.current) {
            tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 })
                .to(filtersRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
                .to(tagsRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
        }
    }, { scope: containerRef })

    const [runDate, setRunDate] = useState(todayYYYYMMDD())
    const [filterQ, setFilterQ] = useState('')
    const [filterPriorityMin, setFilterPriorityMin] = useState(0)
    const [filterStatuses, setFilterStatuses] = useState<string[]>([])
    const [filterTags, setFilterTags] = useState<string[]>([])
    const [filterRecurrentOnly, setFilterRecurrentOnly] = useState(false)

    const { data: board, isLoading } = useBoard(workspaceId ?? '', {
        runDate,
        q: filterQ,
        priorityMin: filterPriorityMin > 0 ? filterPriorityMin : undefined,
        statuses: filterStatuses.length > 0 ? filterStatuses : undefined,
        tagIds: filterTags.length > 0 ? filterTags : undefined
    })

    const createTask = useCreateTask(workspaceId ?? '')
    const updateTask = useUpdateTask(workspaceId ?? '')
    const updateSort = useUpdateTaskSortOrder(workspaceId ?? '')
    const updateColumnSortBatch = useUpdateColumnSortOrdersBatch(workspaceId ?? '')
    const { mutateAsync: runDaily } = useRunDaily(workspaceId ?? '')

    const [activeTask, setActiveTask] = useState<any>(null)
    const [activeColumn, setActiveColumn] = useState<any>(null)
    const [startColumnId, setStartColumnId] = useState<string | null>(null)

    const [previewTask, setPreviewTask] = useState<any>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [targetColumnForCreate, setTargetColumnForCreate] = useState<string>('todo')

    // NEW: Column Creation State
    const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false)

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

    // Column IDs for DndKit
    const columnIds = useMemo(() => columns.map(c => c.id), [columns])

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

    const openCreateTaskModal = (colKey?: string) => {
        setTargetColumnForCreate(colKey || 'todo')
        setIsCreateOpen(true)
    }

    // --- DnD Handlers ---

    const findColumn = (id: string) => columns.find(c => c.tasks.some((t: any) => t.id === id) || c.id === id || c.key === id)

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event

        const activeType = active.data.current?.type
        if (activeType === 'COLUMN') {
            setActiveColumn(active.data.current?.column)
            return
        }

        if (activeType === 'TASK') {
            setActiveTask(active.data.current?.task)
            const col = findColumn(active.id as string)
            if (col) setStartColumnId(col.id)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        setActiveColumn(null)
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

                    // Optimistic update done, save to backend is handled by toggle button
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

        if (activeType === 'COLUMN') return

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

                const newCols = [...prev]
                const newActiveCol = { ...newCols[activeColIndex], tasks: [...newCols[activeColIndex].tasks] }
                const newOverCol = { ...newCols[overColIndex], tasks: [...newCols[overColIndex].tasks] }

                newActiveCol.tasks.splice(activeTaskIndex, 1)

                const overTaskIndex = newOverCol.tasks.findIndex((t: any) => t.id === overId)
                let newIndex
                if (overTaskIndex >= 0) {
                    const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : newOverCol.tasks.length + 1;
                } else {
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

    const handleCreateTaskSubmit = async (data: any) => {
        await createTask.mutateAsync({ ...data, workspaceId })
        setIsCreateOpen(false)
    }

    const { mutateAsync: createRecurrence } = useCreateRecurrenceTemplate(workspaceId ?? '')

    const handleCreateRecurrence = async (data: any) => {
        try {
            await createRecurrence({
                ...data,
                cadence: 'daily',
                isActive: true,
                statusDefault: data.status
            })
            await runDaily({ runDate })
        } catch (error) {
            console.error('Error creating recurrence or triggering run:', error)
        }
    }

    // Toggle Helpers
    const toggleStatus = (status: string) => {
        setFilterStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
    }
    const toggleTag = (tagId: string) => {
        setFilterTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId])
    }

    const handleToggleLayoutMode = async () => {
        if (isLayoutMode) {
            // Save changes
            const items = columns.map((c, i) => ({ id: c.id, sortOrder: i + 1 }))
            await updateColumnSortBatch.mutateAsync(items)
        }
        setIsLayoutMode(!isLayoutMode)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="space-y-4" ref={containerRef}>
                {/* Board Header & Filters */}
                <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-4 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4" ref={headerRef}>
                        <div>
                            <div className="text-lg font-semibold">Board</div>
                            <div className="text-sm tg-muted">workspace: {workspaceId}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm tg-muted">runDate</label>
                            <div className="w-[180px]">
                                <LiquidDateInput value={runDate} onChange={setRunDate} />
                            </div>
                            <button onClick={handleToggleLayoutMode} className={`p-2 rounded-xl border ${isLayoutMode ? 'bg-green-500/20 text-green-200 border-green-500/50' : 'bg-white/10 text-white border-white/10'}`}>
                                {isLayoutMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setFilterRecurrentOnly(!filterRecurrentOnly)} className={`p-2 rounded-xl border ${filterRecurrentOnly ? 'bg-blue-500/20 text-blue-200 border-blue-500/50' : 'bg-white/10 text-white border-white/10'}`}>
                                <Repeat className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-white/5" ref={filtersRef}>
                        <div className="relative group w-full md:w-auto md:min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <input
                                value={filterQ}
                                onChange={e => setFilterQ(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:bg-black/30 text-white"
                            />
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

                        <div className="w-[140px]">
                            <LiquidSelect
                                label=""
                                placeholder="Priority"
                                value={filterPriorityMin}
                                onChange={(v) => setFilterPriorityMin(Number(v))}
                                options={[
                                    { label: 'All Priorities', value: 0 },
                                    { label: 'High Only (P1)', value: 1 },
                                    { label: 'Medium+ (P2+)', value: 2 },
                                    { label: 'Low+ (P3+)', value: 3 }
                                ]}
                            />
                        </div>

                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                            {['todo', 'in_progress', 'blocked', 'done'].map(s => (
                                <button key={s} onClick={() => toggleStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterStatuses.includes(s) ? 'bg-white/10 text-white' : 'text-white/40'}`}>
                                    {s.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {availableTags.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1" ref={tagsRef}>
                            <Filter className="w-3 h-3 text-white/30" />
                            {availableTags.map(tag => (
                                <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-2 py-1 rounded text-[10px] border ${filterTags.includes(tag.id) ? 'bg-white/10' : 'opacity-60 grayscale'}`} style={{ color: tag.color, borderColor: tag.color }}>
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading && <div className="text-center p-8 text-white/40">Loading board...</div>}

                {/* Board Columns */}
                {!isLoading && board && (
                    <div className="flex-1 overflow-x-auto pt-6">
                        <div className="h-full flex px-4 pb-12 gap-6 min-w-fit">
                            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                {columns.map((col) => {
                                    const displayedTasks = col.tasks?.filter((t: any) => {
                                        if (filterRecurrentOnly) return !!t.templateId
                                        return true
                                    }) || []

                                    return (
                                        <BoardColumn
                                            key={col.id}
                                            column={col}
                                            tasks={col.tasks || []}
                                            isOverlay={false}
                                            isLayoutMode={isLayoutMode}
                                        >
                                            <SortableContext items={displayedTasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                                                <DroppableColumnBody columnId={col.key}>
                                                    <div className="space-y-2 flex-1 min-h-[50px]">
                                                        {displayedTasks.map((t: any) => (
                                                            <TaskCard key={t.id} task={t} onClick={(task) => setPreviewTask(task)} />
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
                                                    onClick={() => openCreateTaskModal(col.key)}
                                                    className="w-full mt-2 py-2 border border-white/5 border-dashed rounded-xl text-xs text-white/30 hover:text-white hover:bg-white/5"
                                                >
                                                    + Task
                                                </button>
                                            )}
                                        </BoardColumn>
                                    )
                                })}
                            </SortableContext>

                            {/* Add Column Button */}
                            <div className="w-[300px] shrink-0">
                                <button
                                    onClick={() => setIsCreateColumnOpen(true)}
                                    className="w-full h-[60px] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-sm font-semibold gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Column
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {board?.columns?.length === 0 && (
                    <div className="mt-12 flex justify-center">
                        <LiquidSurface className="p-8 rounded-3xl max-w-md text-center space-y-4" interactive>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 mx-auto flex items-center justify-center border border-white/10 text-white/60 mb-4">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Let's set up your board</h2>
                            <p className="text-white/60">This workspace is empty. Create your first column to get started.</p>
                            <button
                                onClick={() => setIsCreateColumnOpen(true)}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-95"
                            >
                                Create First Column
                            </button>
                        </LiquidSurface>
                    </div>
                )}

                {/* Portals */}
                {createPortal(
                    <DragOverlay>
                        {activeColumn && <BoardColumn column={activeColumn} tasks={activeColumn.tasks} isOverlay />}
                        {activeTask && <TaskCard task={activeTask} isOverlay />}
                    </DragOverlay>,
                    document.body
                )}

                <TaskPreviewModal
                    isOpen={!!previewTask}
                    onClose={() => setPreviewTask(null)}
                    task={previewTask}
                />
                <CreateTaskModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    initialStatus={targetColumnForCreate}
                    onSubmit={handleCreateTaskSubmit}
                    onRecurrenceSubmit={handleCreateRecurrence}
                />
                <CreateColumnModal
                    isOpen={isCreateColumnOpen}
                    onClose={() => setIsCreateColumnOpen(false)}
                    workspaceId={workspaceId || ''}
                />
            </div>
        </DndContext>
    )
}
