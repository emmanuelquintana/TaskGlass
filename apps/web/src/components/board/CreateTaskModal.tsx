import { useState, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { LiquidDateInput } from '../ui/LiquidDateInput'
import { LiquidSelect } from '../ui/LiquidSelect'
import { LiquidTagInput } from '../ui/LiquidTagInput'
import { Repeat } from 'lucide-react'
import { useStaggerList } from '../../hooks/useAnimations'
import { LiquidButton } from '../ui/LiquidButton'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => Promise<void>
    onRecurrenceSubmit: (data: any) => Promise<void>
    initialStatus: string
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, onRecurrenceSubmit, initialStatus }: CreateTaskModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<number>(0)
    const [dueDate, setDueDate] = useState('')
    const [tags, setTags] = useState('')

    // Recurrence State
    const [isRecurrent, setIsRecurrent] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    // Animation Ref - Use state to trigger effect when element mounts
    const [formEl, setFormEl] = useState<HTMLFormElement | null>(null)
    const formRef = { current: formEl }

    useStaggerList(formRef, { delay: 0.2, dependencies: [isOpen, formEl] })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsLoading(true)
        try {
            const commonData = {
                title,
                description,
                priority: priority === 0 ? undefined : priority,
                status: initialStatus
            }

            if (isRecurrent) {
                await onRecurrenceSubmit({
                    ...commonData,
                    // Recurrence specific
                    cadence: 'daily',
                    tagIds: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                })
            } else {
                await onSubmit({
                    ...commonData,
                    dueDate: dueDate || undefined,
                    tagIds: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                })
            }

            // Reset forms
            setTitle('')
            setDescription('')
            setPriority(0)
            setDueDate('')
            setTags('')
            setIsRecurrent(false)
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isRecurrent ? "Create Daily Routine" : "Create New Task"}>
            <form onSubmit={handleSubmit} className="space-y-4" ref={setFormEl}>

                {/* Header Toggle for Recurrence */}
                <div className="flex items-center justify-end mb-2">
                    <button
                        type="button"
                        onClick={() => setIsRecurrent(!isRecurrent)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isRecurrent
                            ? 'bg-purple-500/20 text-purple-200 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white/60'
                            }`}
                    >
                        <Repeat className={`w-3.5 h-3.5 ${isRecurrent ? 'animate-spin-slow' : ''}`} />
                        {isRecurrent ? 'Repeat: Daily' : 'One-off Task'}
                    </button>
                </div>

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

                {/* Row: Priority & Due Date/Cadence */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Priority</label>
                        <LiquidSelect
                            value={priority}
                            onChange={(val) => setPriority(Number(val))}
                            options={[
                                { label: 'None', value: 0 },
                                { label: 'High (P1)', value: 1, className: 'text-red-400' },
                                { label: 'Medium (P2)', value: 2, className: 'text-yellow-400' },
                                { label: 'Low (P3)', value: 3, className: 'text-blue-400' },
                            ]}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                            {isRecurrent ? 'Cadence' : 'Due Date'}
                        </label>
                        {isRecurrent ? (
                            <div className="w-full rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200 flex items-center gap-2 cursor-not-allowed opacity-80">
                                <Repeat className="w-4 h-4" />
                                <span>Daily (Every Day)</span>
                            </div>
                        ) : (
                            <LiquidDateInput
                                value={dueDate}
                                onChange={setDueDate}
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <LiquidTagInput
                        label="Tags"
                        value={tags}
                        onChange={setTags}
                        placeholder="e.g. frontend, bug..."
                    />
                </div>

                {isRecurrent && (
                    <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200/70">
                        This task will be automatically created every day at midnight in the <strong>{initialStatus}</strong> column.
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <LiquidButton
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium"
                    >
                        Cancel
                    </LiquidButton>
                    <LiquidButton
                        type="submit"
                        disabled={!title.trim() || isLoading}
                        className={`px-6 py-2 text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isRecurrent
                            ? '!bg-purple-500 !text-white !shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:!bg-purple-400'
                            : ''
                            }`}
                    >
                        {isLoading ? 'Saving...' : isRecurrent ? 'Enable Daily Routine' : 'Create Task'}
                    </LiquidButton>
                </div>
            </form>
        </Modal>
    )
}
