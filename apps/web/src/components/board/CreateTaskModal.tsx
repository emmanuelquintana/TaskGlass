import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LiquidDateInput } from '../ui/LiquidDateInput'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => Promise<void>
    initialStatus: string
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, initialStatus }: CreateTaskModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<number>(0)
    const [dueDate, setDueDate] = useState('')
    const [tags, setTags] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsLoading(true)
        try {
            await onSubmit({
                title,
                description,
                priority: priority === 0 ? undefined : priority,
                dueDate: dueDate || undefined,
                tagIds: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined, // Placeholder logic
                status: initialStatus
            })
            // Reset form
            setTitle('')
            setDescription('')
            setPriority(0)
            setDueDate('')
            setTags('')
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Title</label>
                    <input
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-2.5 text-sm outline-none focus:bg-black/40 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Add more details..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/5 bg-black/20 px-4 py-2.5 text-sm outline-none focus:bg-black/40 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Row: Priority & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Priority</label>
                        <select
                            value={priority}
                            onChange={e => setPriority(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-pointer appearance-none"
                        >
                            <option value="0" className="bg-[#1a1a1a]">None</option>
                            <option value="1" className="bg-[#1a1a1a] text-red-400">High (P1)</option>
                            <option value="2" className="bg-[#1a1a1a] text-yellow-400">Medium (P2)</option>
                            <option value="3" className="bg-[#1a1a1a] text-blue-400">Low (P3)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Due Date</label>
                        <LiquidDateInput
                            value={dueDate}
                            onChange={setDueDate}
                        />
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Tags</label>
                    <input
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="e.g. frontend, bug, urgent (comma separated)"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim() || isLoading}
                        className="rounded-xl bg-white text-black px-6 py-2 text-sm font-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        {isLoading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
