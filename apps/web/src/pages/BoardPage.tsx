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
import { Search, Filter, Pencil, Check, Repeat, Plus, X } from 'lucide-react'
import {
    useBoard,
    useCreateTask,
    useUpdateTaskSortOrder,
    useUpdateColumnSortOrdersBatch
} from '../api/board.api'
import { TaskPreviewModal } from '../components/board/TaskPreviewModal'
import { CreateTaskModal } from '../components/board/CreateTaskModal'
import { CreateColumnModal } from '../components/board/CreateColumnModal'
import { LiquidScrollArea } from '../components/ui/LiquidScrollArea'
import { LiquidSelect } from '../components/ui/LiquidSelect'
import { LiquidDateInput } from '../components/ui/LiquidDateInput'
import { LiquidButton } from '../components/ui/LiquidButton'
import { useCreateRecurrenceTemplate, useRunDaily } from '../api/recurrence.api'
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
    const updateSort = useUpdateTaskSortOrder(workspaceId ?? '')
    const updateColumnSortBatch = useUpdateColumnSortOrdersBatch(workspaceId ?? '')
    const { mutateAsync: runDaily } = useRunDaily(workspaceId ?? '')

    // Global Animations
    useGSAP(() => {
        if (isLoading) {
            gsap.set([headerRef.current, filtersRef.current, tagsRef.current], { opacity: 0 })
            return
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        gsap.set([headerRef.current, filtersRef.current], { opacity: 0, y: -20 })
        gsap.set(tagsRef.current, { opacity: 0, y: 10 })

        if (headerRef.current) {
            tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 })
                .to(filtersRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
                .to(tagsRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
        }
    }, { scope: containerRef, dependencies: [isLoading] })

    const [activeTask, setActiveTask] = useState<any>(null)
    const [activeColumn, setActiveColumn] = useState<any>(null)

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

    const colsRef = useRef<HTMLDivElement>(null)
    useBoxStagger(colsRef) // Will implement useBoxStagger or just useStaggerList

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
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        setActiveColumn(null)

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

        // Efficiently update BOTH status and sort order in one batch call if column exists
        if (overColumn) {
            const items = overColumn.tasks.map((t: any, i: number) => ({
                id: t.id,
                sortOrder: i + 1,
                status: overColumn.key // This updates the task status if it moved columns
            }))

            if (items.length > 0) {
                await updateSort.mutateAsync({
                    workspaceId: workspaceId!,
                    items
                })
            }
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

    const clearFilters = () => {
        setFilterQ('')
        setFilterPriorityMin(0)
        setFilterStatuses([])
        setFilterTags([])
        setFilterRecurrentOnly(false)
    }

    const hasFilters = filterQ || filterPriorityMin > 0 || filterStatuses.length > 0 || filterTags.length > 0 || filterRecurrentOnly

    const handleToggleLayoutMode = async () => {
        if (isLayoutMode) {
            // Save changes
            const items = columns.map((c, i) => ({ id: c.id, sortOrder: i + 1 }))
            if (items.length > 0) {
                await updateColumnSortBatch.mutateAsync(items)
            }
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
                <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-4 space-y-4 relative">
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
                            <LiquidButton variant="icon" isActive={isLayoutMode} onClick={handleToggleLayoutMode}>
                                {isLayoutMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            </LiquidButton>
                            <LiquidButton variant="icon" isActive={filterRecurrentOnly} onClick={() => setFilterRecurrentOnly(!filterRecurrentOnly)} className={filterRecurrentOnly ? "!bg-blue-500/20 !text-blue-200 !border-blue-500/50" : ""}>
                                <Repeat className="w-4 h-4" />
                            </LiquidButton>
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4" ref={filtersRef}>
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 tg-muted" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="bg-transparent border-b border-white/10 focus:border-white/30 outline-none text-sm pb-1 tg-text transition-colors"
                                value={filterQ}
                                onChange={(e) => setFilterQ(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {hasFilters && (
                                <LiquidButton
                                    variant="ghost"
                                    onClick={clearFilters}
                                    className="!text-red-300 hover:!text-red-200 flex items-center gap-2 !px-3 !py-1.5 !bg-red-500/10 hover:!bg-red-500/20"
                                >
                                    <span className="font-medium text-xs">Clear</span>
                                    <X className="w-3 h-3" />
                                </LiquidButton>
                            )}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 tg-muted" />
                                <LiquidSelect
                                    options={[
                                        { value: 0, label: 'All Priorities' },
                                        { value: 1, label: 'Priority 1+' },
                                        { value: 2, label: 'Priority 2+' },
                                        { value: 3, label: 'Priority 3+' },
                                        { value: 4, label: 'Priority 4+' },
                                        { value: 5, label: 'Priority 5' },
                                    ]}
                                    value={filterPriorityMin}
                                    onChange={(v) => setFilterPriorityMin(Number(v))}
                                    className="w-[150px]"
                                />
                            </div>
                        </div>



                    </div>

                    <div className="flex items-center gap-4 flex-wrap" ref={tagsRef}>
                        {/* Status Filters */}
                        <div className="flex items-center gap-2">
                            {columns.map((col: any) => (
                                <LiquidButton
                                    key={col.key}
                                    variant="ghost"
                                    onClick={() => toggleStatus(col.key)}
                                    className={`!px-3 !py-1.5 !rounded-lg text-xs font-medium ${filterStatuses.includes(col.key) ? 'bg-white/10 text-white' : 'text-white/40'}`}
                                >
                                    {col.title?.toUpperCase()}
                                </LiquidButton>
                            ))}
                        </div>

                        {/* Divider */}
                        {availableTags.length > 0 && <div className="w-px h-6 bg-white/10" />}

                        {/* Tag Filters */}
                        <div className="flex items-center gap-2">
                            {availableTags.map((tag: any) => (
                                <LiquidButton
                                    key={tag.id}
                                    variant="ghost"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`!px-2 !py-1 !rounded text-[10px] border ${filterTags.includes(tag.id) ? 'bg-white/10' : 'opacity-60 grayscale'}`}
                                    style={{ color: tag.color, borderColor: tag.color }}
                                >
                                    {tag.name}
                                </LiquidButton>
                            ))}
                        </div>
                    </div>


                </div>

                {isLoading && <div className="text-center p-8 text-white/40">Loading board...</div>}

                {/* Board Columns */}
                {!isLoading && board && (
                    <div className="flex-1 overflow-hidden relative pt-6">
                        <LiquidScrollArea orientation="horizontal" className="h-full">
                            <div className="h-full flex px-4 pt-4 pb-12 gap-6 min-w-max" ref={colsRef}>
                                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                    {columns.map((col) => {
                                        const tasksInColumn = col.tasks || []
                                        const filteredTasks = filterRecurrentOnly
                                            ? tasksInColumn.filter((t: any) => t.templateId)
                                            : tasksInColumn

                                        return (
                                            <BoardColumn
                                                key={col.id}
                                                column={col}
                                                tasks={filteredTasks}
                                                onAddTask={() => openCreateTaskModal(col.key)}
                                                isLayoutMode={isLayoutMode}
                                            >
                                                <SortableContext items={filteredTasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                                                    <DroppableColumnBody columnId={col.id}>
                                                        {filteredTasks.map((task: any) => (
                                                            <TaskCard
                                                                key={task.id}
                                                                task={task}
                                                                onClick={(t) => setPreviewTask(t)}
                                                            />
                                                        ))}
                                                    </DroppableColumnBody>
                                                </SortableContext>
                                            </BoardColumn>
                                        )
                                    })}
                                </SortableContext>

                                {/* Add Column Button */}
                                <div className="w-[300px] flex-shrink-0 pt-4 opacity-50 hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setIsCreateColumnOpen(true)}
                                        className="w-full h-[150px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group"
                                    >
                                        <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="font-medium">Add Column</span>
                                    </button>
                                </div>
                            </div>
                        </LiquidScrollArea>
                    </div>
                )}
            </div>

            {/* Modals */}
            <TaskPreviewModal
                isOpen={!!previewTask}
                onClose={() => setPreviewTask(null)}
                task={previewTask}
            />

            <CreateTaskModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateTaskSubmit}
                onRecurrenceSubmit={handleCreateRecurrence}
                initialStatus={targetColumnForCreate}
            />

            <CreateColumnModal
                isOpen={isCreateColumnOpen}
                onClose={() => setIsCreateColumnOpen(false)}
                workspaceId={workspaceId ?? ''}
            />

            <DragOverlay>
                {activeTask && (
                    <TaskCard
                        task={activeTask}
                        isOverlay
                    />
                )}
                {activeColumn && (
                    <BoardColumn
                        // id and title removed
                        column={activeColumn}
                        tasks={activeColumn.tasks}
                        isOverlay
                    />
                )}
            </DragOverlay>
        </DndContext >
    )
}

function useBoxStagger(ref: any) {
    useGSAP(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current.children,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        )
    }, { scope: ref })
}

