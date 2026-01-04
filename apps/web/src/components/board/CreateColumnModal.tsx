import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LiquidInput } from '../ui/LiquidInput'
import { useCreateColumn } from '../../api/board.api'
import { Loader2 } from 'lucide-react'
import { LiquidButton } from '../ui/LiquidButton'

interface CreateColumnModalProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
}

export function CreateColumnModal({ isOpen, onClose, workspaceId }: CreateColumnModalProps) {
    const [title, setTitle] = useState('')
    const [key, setKey] = useState('')
    const createColumn = useCreateColumn(workspaceId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !key.trim()) return

        try {
            await createColumn.mutateAsync({ title, key })
            setTitle('')
            setKey('')
            onClose()
        } catch (error) {
            console.error('Failed to create column', error)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Title</label>
                        <LiquidInput
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value)
                                // Auto-generate key from title
                                if (!key) {
                                    setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                                }
                            }}
                            placeholder="e.g. In Review"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Key</label>
                        <LiquidInput
                            value={key}
                            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                            placeholder="in_review"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <LiquidButton
                        type="submit"
                        disabled={!title.trim() || !key.trim() || createColumn.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                    >
                        {createColumn.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Column
                    </LiquidButton>
                </div>
            </form>
        </Modal>
    )
}
