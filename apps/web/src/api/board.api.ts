import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, apiPut, apiPost, apiDelete } from '../lib/http'
import type { Board, BoardColumn, BoardTask } from '../types/board'

export function useBoard(workspaceId: string, params?: {
    runDate?: string
    savedViewId?: string
    q?: string
    statuses?: string[]
    priorityMin?: number
    priorityMax?: number
    tagIds?: string[]
}) {
    return useQuery({
        queryKey: ['board', workspaceId, params],
        queryFn: async () => {
            // Build query string
            const search = new URLSearchParams()
            if (params?.runDate) search.set('runDate', params.runDate)
            if (params?.savedViewId) search.set('savedViewId', params.savedViewId)
            if (params?.q) search.set('q', params.q)
            if (params?.statuses) params.statuses.forEach(s => search.append('statuses[]', s))
            if (params?.priorityMin) search.set('priorityMin', params.priorityMin.toString())
            if (params?.priorityMax) search.set('priorityMax', params.priorityMax.toString())
            if (params?.tagIds) params.tagIds.forEach(t => search.append('tagIds[]', t))

            const r = await apiGet<Board>(`/v1/workspaces/${workspaceId}/board?${search.toString()}`)
            return r.data
        },
        enabled: !!workspaceId
    })
}


export function useCreateTask(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const r = await apiPost<BoardTask>('/v1/tasks', data)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useUpdateTask(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { id: string; dto: any }) => {
            const r = await apiPatch<BoardTask>(`/v1/tasks/${data.id}`, data.dto)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useUpdateTaskSortOrder(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { workspaceId: string; items: { id: string; sortOrder: number; status?: string }[] }) => {
            if (!data.items?.length) return null

            // Include workspaceId in the body as required by BatchUpdateTaskSortOrderDto
            const r = await apiPut<BoardTask[]>('/v1/tasks/sort-order', {
                workspaceId: data.workspaceId,
                items: data.items
            })
            return r.data
        },
        onSuccess: () => {
            // Invalidate board to refresh order
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}


export function useCreateColumn(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { title: string; key: string }) => {
            const r = await apiPost<BoardColumn>(`/v1/workspaces/${workspaceId}/columns`, data)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useUpdateColumnTitle(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { id: string; title: string }) => {
            const r = await apiPatch<BoardColumn>(`/v1/columns/${data.id}`, { title: data.title })
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useUpdateColumnSortOrder(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { id: string; sortOrder: number }) => {
            const r = await apiPatch<BoardColumn>(`/v1/columns/${data.id}/sort-order`, { sortOrder: data.sortOrder })
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useUpdateColumnSortOrdersBatch(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (items: { id: string; sortOrder: number }[]) => {
            if (!items?.length) return null
            const r = await apiPut<BoardColumn[]>(`/v1/columns/sort-order`, { items })
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useDeleteTasksByFilter(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (filter: { status?: string }) => {
            const search = new URLSearchParams()
            if (filter.status) search.set('status', filter.status)

            const r = await apiDelete<{ count: number }>(`/v1/workspaces/${workspaceId}/tasks?${search.toString()}`)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}

export function useDeleteColumn(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiDelete(`/v1/columns/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}
