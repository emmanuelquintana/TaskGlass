import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { LiquidInput, LiquidTextArea } from '../ui/LiquidInput'
import { useUpdateWorkspace, useDeleteWorkspace } from '../../api/workspace.api'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import type { Workspace } from '../../types/workspace'
import { LiquidButton } from '../ui/LiquidButton'

interface EditWorkspaceModalProps {
    isOpen: boolean
    onClose: () => void
    workspace: Workspace | null
}

export function EditWorkspaceModal({ isOpen, onClose, workspace }: EditWorkspaceModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(false)

    const updateWorkspace = useUpdateWorkspace()
    const deleteWorkspace = useDeleteWorkspace()

    useEffect(() => {
        if (workspace) {
            setName(workspace.name)
            setDescription(workspace.description || '')
            setConfirmDelete(false)
        }
    }, [workspace, isOpen])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workspace || !name.trim()) return

        try {
            await updateWorkspace.mutateAsync({ id: workspace.id, name, description })
            onClose()
        } catch (error) {
            console.error('Failed to update workspace', error)
        }
    }

    const handleDelete = async () => {
        if (!workspace) return
        try {
            await deleteWorkspace.mutateAsync(workspace.id)
            onClose()
        } catch (error) {
            console.error('Failed to delete workspace', error)
        }
    }

    if (!workspace) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Workspace">
            <div className="space-y-6">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Name</label>
                        <LiquidInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Workspace"
                        />
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

                    <div className="flex justify-end border-b border-white/5 pb-6">
                        <LiquidButton
                            type="submit"
                            disabled={!name.trim() || updateWorkspace.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg"
                        >
                            {updateWorkspace.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </LiquidButton>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-200 font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </div>

                    {!confirmDelete ? (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete this workspace
                        </button>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <p className="text-xs text-red-200/80">
                                Are you sure? This action cannot be undone and will delete all boards and tasks.
                            </p>
                            <div className="flex items-center gap-3">
                                <LiquidButton
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleteWorkspace.isPending}
                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 !border-0"
                                >
                                    {deleteWorkspace.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Yes, delete it
                                </LiquidButton>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-xs text-white/40 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
