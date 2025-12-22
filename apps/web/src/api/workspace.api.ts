import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/http'
import type { Workspace } from '../types/workspace'

export function useWorkspaces() {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const r = await apiGet<Workspace[]>('/v1/workspaces')
            return r.data
        },
    })
}
