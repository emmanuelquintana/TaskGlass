import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/http'
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

export function useCreateWorkspace() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { code: string; name: string; description?: string }) => {
            const r = await apiPost<Workspace>('/v1/workspaces', data)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        }
    })
}

export function useUpdateWorkspace() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { id: string; name?: string; description?: string }) => {
            const { id, ...body } = data
            const r = await apiPatch<Workspace>(`/v1/workspaces/${id}`, body)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        }
    })
}

export function useDeleteWorkspace() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const r = await apiDelete<{ id: string }>(`/v1/workspaces/${id}`)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        }
    })
}
