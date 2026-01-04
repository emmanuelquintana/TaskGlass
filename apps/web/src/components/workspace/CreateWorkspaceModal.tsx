import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LiquidInput, LiquidTextArea } from '../ui/LiquidInput'
import { useCreateWorkspace } from '../../api/workspace.api'
import { Loader2 } from 'lucide-react'

interface CreateWorkspaceModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const createWorkspace = useCreateWorkspace()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !code.trim()) return

        try {
            await createWorkspace.mutateAsync({ code, name, description })
            setCode('')
            setName('')
            setDescription('')
            onClose()
        } catch (error) {
            console.error('Failed to create workspace', error)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Name</label>
                        <LiquidInput
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                // Auto-generate code from name if code is empty
                                if (!code) {
                                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
                                }
                            }}
                            placeholder="My Workspace"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Code</label>
                        <LiquidInput
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 32))}
                            placeholder="CODE"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description</label>
                    <LiquidTextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description..."
                        rows={3}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!name.trim() || createWorkspace.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                    >
                        {createWorkspace.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    )
}
