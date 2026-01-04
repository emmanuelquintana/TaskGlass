import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor, KeyboardSensor, useDroppable, type DragStartEvent, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoard, useCreateTask, useUpdateTask, useUpdateTaskSortOrder } from '../api/board.api'
import { CreateTaskModal } from '../components/board/CreateTaskModal'
import { TaskPreviewModal } from '../components/board/TaskPreviewModal'

import { LiquidDateInput } from '../components/ui/LiquidDateInput'
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

    const { data: board, isLoading, error } = useBoard(workspaceId ?? '', { runDate })
    const createTask = useCreateTask(workspaceId ?? '')
    const updateTask = useUpdateTask(workspaceId ?? '')
    const updateSort = useUpdateTaskSortOrder(workspaceId ?? '')

    const [activeId, setActiveId] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [targetColumnForCreate, setTargetColumnForCreate] = useState<string>('todo')

    const columns = useMemo(() => board?.columns ?? [], [board])

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

        // Reordering in same column
        // If dropping on the column container (empty space), overId might be column key/id
        // In that case, we can assume moving to end, OR just ignore reorder if we can't determine index.
        // But SortableContext generally handles item-over-item.
        // If we dropped on "DroppableColumn", overId is column key.

        if (activeColumn.key === overColumn.key && overId === activeColumn.key) {
            // Dropped on the column container itself (e.g. at the bottom)
            // Move to end?
            // Since we don't have indexes for "column container", we might skip reordering
            // unless we want to move it to the very bottom.
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

        if (activeColumn.key !== overColumn.key) {
            // We could allow visual update here for smoother UX
        }
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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="space-y-4">
                <div className="tg-liquid tg-grain tg-interactive rounded-3xl p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <div className="text-lg font-semibold">Board</div>
                        <div className="text-sm tg-muted">workspaceId: {workspaceId}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm tg-muted">runDate</label>
                        <input
                            value={runDate}
                            onChange={(e) => setRunDate(e.target.value)}
                            type="date"
                            className="tg-liquid tg-grain tg-interactive rounded-xl px-3 py-2 text-sm outline-none"
                        />
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
