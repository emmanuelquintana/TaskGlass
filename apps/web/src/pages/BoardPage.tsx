import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoard } from '../api/board.api'

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

    const { data, isLoading, error } = useBoard(workspaceId ?? '', { runDate })

    const columns = data?.columns ?? []
    const tasks = data?.tasks ?? []

    const tasksByStatus = useMemo(() => {
        const map = new Map<string, typeof tasks>()
        for (const t of tasks) {
            const k = t.status
            if (!map.has(k)) map.set(k, [])
            map.get(k)!.push(t)
        }
        // orden por sortOrder si viene, si no por title
        for (const [k, arr] of map.entries()) {
            arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title))
            map.set(k, arr)
        }
        return map
    }, [tasks])

    return (
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

            {!isLoading && data && (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(240px, 1fr))` }}>
                    {columns.map((c) => {
                        const colTasks = tasksByStatus.get(c.key) ?? []
                        return (
                            <section key={c.key} className="tg-liquid tg-grain tg-interactive rounded-3xl p-3">
                                <div className="flex items-baseline justify-between px-2">
                                    <div className="font-semibold">{c.title}</div>
                                    <div className="text-xs tg-muted">{colTasks.length}</div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {colTasks.map((t) => (
                                        <div key={t.id} className="tg-liquid tg-grain tg-interactive rounded-2xl p-3">
                                            <div className="text-sm font-semibold">{t.title}</div>
                                            {t.description && <div className="text-xs tg-muted mt-1">{t.description}</div>}
                                            <div className="mt-2 text-[11px] tg-muted">
                                                {t.priority ? `P${t.priority}` : ''} {t.dueDate ? ` • ${t.dueDate}` : ''}
                                            </div>
                                        </div>
                                    ))}

                                    {colTasks.length === 0 && (
                                        <div className="px-2 py-6 text-sm tg-muted">Sin tareas</div>
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
