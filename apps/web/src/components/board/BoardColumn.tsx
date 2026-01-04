import { useState } from 'react'
import { LiquidConfirmationModal } from '../ui/LiquidConfirmationModal'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, XCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useDeleteTasksByFilter, useDeleteColumn } from '../../api/board.api'

import type { BoardColumn as IBoardColumn, BoardTask } from '../../types/board'

export function BoardColumn({ column, children, isLayoutMode, tasks, isOverlay, onAddTask }: { column: IBoardColumn, children?: React.ReactNode, isLayoutMode?: boolean, tasks?: BoardTask[], isOverlay?: boolean, onAddTask?: () => void }) {
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
        disabled: !isLayoutMode && !isOverlay
    })

    const { workspaceId } = useParams<{ workspaceId: string }>()
    const deleteTasks = useDeleteTasksByFilter(workspaceId ?? '')
    const deleteColumn = useDeleteColumn(workspaceId ?? '')

    const [isClearModalOpen, setIsClearModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleClearColumn = () => {
        if (!workspaceId) return
        setIsClearModalOpen(true)
    }

    const confirmClearColumn = async () => {
        await deleteTasks.mutateAsync({ status: column.key })
        setIsClearModalOpen(false)
    }

    const handleDeleteColumn = () => {
        if (!workspaceId) return
        setIsDeleteModalOpen(true)
    }

    const confirmDeleteColumn = async () => {
        await deleteColumn.mutateAsync(column.id)
        setIsDeleteModalOpen(false)
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    if (isOverlay) {
        return (
            <div
                className="flex flex-col gap-4 rounded-3xl p-4 w-[300px] flex-shrink-0 border border-purple-500/50 tg-liquid tg-grain brightness-110 shadow-2xl cursor-grabbing"
            >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: (column as any).color || '#fff' }} />
                        <h3 className="font-semibold text-white/90">{column.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">
                            {tasks?.length || 0}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-h-[100px] bg-white/5 rounded-2xl" />
            </div>
        )
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`flex flex-col gap-4 rounded-3xl p-4 transition-all duration-300 w-[300px] flex-shrink-0
                ${isLayoutMode ? 'border-2 border-purple-500/30 bg-purple-500/5' : 'border border-transparent'}
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
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: (column as any).color || '#fff' }} />
                            <h3 className="font-semibold text-white/90">{column.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">
                                {tasks?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {isLayoutMode ? (
                            <button
                                onClick={handleDeleteColumn}
                                className="text-white/20 hover:text-red-500 transition-colors p-1"
                                title="Delete Column"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        ) : (
                            (tasks?.length || 0) > 0 && (
                                <button
                                    onClick={handleClearColumn}
                                    className="text-white/20 hover:text-red-400 transition-colors p-1 opacity-0 group-hover/column:opacity-100"
                                    title="Clear Column"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )
                        )}
                    </div>
                </div>
                {children}

                {
                    onAddTask && !isLayoutMode && (
                        <button
                            onClick={onAddTask}
                            className="w-full py-2 border border-white/5 border-dashed rounded-xl text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            + Task
                        </button>
                    )
                }
            </div >

            <LiquidConfirmationModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={confirmClearColumn}
                title="Clear Column"
                description={`Are you sure you want to delete all tasks in "${column.title}"? This cannot be undone.`}
                confirmText="Clear All"
                cancelText="Cancel"
                variant="danger"
            />

            <LiquidConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteColumn}
                title="Delete Column"
                description={`Are you sure you want to PERMANENTLY delete the column "${column.title}" and all its tasks? This action is irreversible.`}
                confirmText="Delete Permanently"
                cancelText="Keep Column"
                variant="danger"
            />
        </>
    )
}
