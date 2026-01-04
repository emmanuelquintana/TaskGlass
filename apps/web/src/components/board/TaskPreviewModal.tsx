import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { useUpdateTask } from '../../api/board.api'
import { LiquidInput, LiquidTextArea } from '../ui/LiquidInput'
import { LiquidSelect } from '../ui/LiquidSelect'
import { LiquidDateInput } from '../ui/LiquidDateInput'
import { Check, Loader2 } from 'lucide-react'

interface TaskPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    task: any
}

export function TaskPreviewModal({ isOpen, onClose, task }: TaskPreviewModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState(0)
    const [dueDate, setDueDate] = useState('')
    const [points, setPoints] = useState(0)

    useEffect(() => {
        if (task) {
            setTitle(task.title || '')
            setDescription(task.description || '')
            setPriority(task.priority || 0)
            setDueDate(task.dueDate || '')
            setPoints(task.points || 0)
        }
    }, [task, isOpen])

    const updateTask = useUpdateTask(task?.workspaceId || '')

    const handleSave = async () => {
        if (!task) return
        try {
            await updateTask.mutateAsync({
                id: task.id,
                dto: {
                    title,
                    description,
                    priority: Number(priority),
                    dueDate: dueDate || null,
                    points: Number(points)
                }
            })
            onClose()
        } catch (error) {
            console.error('Failed to update task', error)
        }
    }

    if (!task) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
            <div className="space-y-5">
                {/* Title */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Title</label>
                    <LiquidInput
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title"
                        className="text-lg font-bold"
                    />
                </div>

                {/* Priority & Points Row */}
                <div className="grid grid-cols-2 gap-4">
                    <LiquidSelect
                        label="Priority"
                        value={priority}
                        onChange={(v) => setPriority(Number(v))}
                        placeholder="Select Priority"
                        options={[
                            { label: 'None', value: 0 },
                            { label: 'High (P1)', value: 1, className: 'text-red-400' },
                            { label: 'Medium (P2)', value: 2, className: 'text-yellow-400' },
                            { label: 'Low (P3)', value: 3, className: 'text-blue-400' }
                        ]}
                    />
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Points</label>
                        <LiquidInput
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            placeholder="e.g. 5"
                        />
                    </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                    <LiquidDateInput
                        label="Due Date"
                        value={dueDate}
                        onChange={setDueDate}
                    />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Description</label>
                    <LiquidTextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add more details..."
                        rows={5}
                    />
                </div>

                {/* Tags Display (Read-only for now) */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tags</label>
                    <div className="flex flex-wrap gap-2 p-2 bg-black/20 rounded-xl border border-white/5 min-h-[40px]">
                        {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tag: any) => (
                                <span
                                    key={tag.id}
                                    className="px-2 py-1 rounded-lg text-xs font-medium border border-white/10"
                                    style={{ backgroundColor: tag.color ? `${tag.color}20` : 'rgba(255,255,255,0.1)', color: tag.color || 'white', borderColor: tag.color ? `${tag.color}40` : 'rgba(255,255,255,0.1)' }}
                                >
                                    #{tag.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-white/20 italic">No tags</span>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                        onClick={handleSave}
                        disabled={updateTask.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    )
}
