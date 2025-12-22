import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/http'
import type { BoardResponse } from '../types/board'

export function useBoard(workspaceId: string, opts: { runDate?: string; savedViewId?: string }) {
    return useQuery({
        queryKey: ['board', workspaceId, opts.runDate ?? null, opts.savedViewId ?? null],
        enabled: Boolean(workspaceId),
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (opts.runDate) qs.set('runDate', opts.runDate)
            if (opts.savedViewId) qs.set('savedViewId', opts.savedViewId)

            const url = `/v1/workspaces/${workspaceId}/board${qs.toString() ? `?${qs.toString()}` : ''}`
            const r = await apiGet<BoardResponse>(url)
            return r.data
        },
    })
}
