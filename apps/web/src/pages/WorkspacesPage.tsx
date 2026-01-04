import { useState, useRef } from 'react'
import { useWorkspaces } from '../api/workspace.api'
import { LiquidSurface } from '../components/ui/LiquidSurface'
import { Plus, Settings, Briefcase } from 'lucide-react'
import { CreateWorkspaceModal } from '../components/workspace/CreateWorkspaceModal'
import { EditWorkspaceModal } from '../components/workspace/EditWorkspaceModal'
import type { Workspace } from '../types/workspace'
import { Link } from 'react-router-dom'
import { useStaggerList, useButtonHover } from '../hooks/useAnimations'

export function WorkspacesPage() {
    const { data: workspaces, isLoading, error } = useWorkspaces()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null)

    const listRef = useRef<HTMLDivElement>(null)
    const newBtnRef = useRef<HTMLButtonElement>(null)

    useStaggerList(listRef, '.group') // Stagger items with class .group
    useButtonHover(newBtnRef)

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Workspaces</h1>
                    <p className="tg-muted mt-1">Manage your team environments and projects.</p>
                </div>
                <button
                    ref={newBtnRef}
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                    <Plus className="w-5 h-5" />
                    New Workspace
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={listRef}>
                {isLoading && (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />
                    ))
                )}

                {error && (
                    <div className="col-span-full p-8 text-center text-red-300 bg-red-500/10 rounded-3xl border border-red-500/20">
                        Failed to load workspaces. Please try again.
                    </div>
                )}

                {workspaces?.map((w) => (
                    <div key={w.id} className="group relative">
                        <LiquidSurface className="h-full p-6 rounded-3xl flex flex-col justify-between transition-all hover:scale-[1.02]" interactive>

                            {/* Top Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 text-white/60">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white/90">{w.name}</h3>
                                        <div className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded w-fit mt-1">
                                            {w.code}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setEditingWorkspace(w)
                                    }}
                                    className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Description */}
                            <p className="mt-4 text-sm text-white/50 line-clamp-2 min-h-[40px]">
                                {w.description || "No description provided."}
                            </p>

                            {/* Footer Actions */}
                            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="text-xs text-white/30">
                                    {/* Placeholder for stats if available later */}
                                    Active
                                </div>
                                <Link
                                    to={`/w/${w.id}/board`}
                                    className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1 group/link"
                                >
                                    Open Board
                                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>
                        </LiquidSurface>
                    </div>
                ))}
            </div>

            <CreateWorkspaceModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            <EditWorkspaceModal
                isOpen={!!editingWorkspace}
                onClose={() => setEditingWorkspace(null)}
                workspace={editingWorkspace}
            />
        </div>
    )
}
