import { Modal } from '../ui/Modal'

interface TaskPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    task: any
}

export function TaskPreviewModal({ isOpen, onClose, task }: TaskPreviewModalProps) {
    if (!task) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 1 ? 'bg-red-500/20 text-red-200' :
                                    task.priority === 2 ? 'bg-yellow-500/20 text-yellow-200' :
                                        task.priority === 3 ? 'bg-blue-500/20 text-blue-200' :
                                            'bg-white/10 text-white/50'
                                }`}>
                                {task.priority ? `P${task.priority}` : 'No Priority'}
                            </span>
                            {task.status && (
                                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">
                                    {task.status.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Description</label>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-sm text-white/80 leading-relaxed min-h-[100px]">
                        {task.description || <span className="text-white/20 italic">No description provided</span>}
                    </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Due Date</label>
                        <div className="text-sm font-medium">{task.dueDate || 'No due date'}</div>
                    </div>
                    {/* Tags */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tags</label>
                        <div className="flex flex-wrap gap-2">
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
                </div>
            </div>
        </Modal>
    )
}
