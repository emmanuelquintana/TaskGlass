import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, apiPost, apiPut } from '../lib/http'
import type { BoardResponse } from '../types/board'
import type { CreateTaskDto, UpdateTaskDto, BatchUpdateTaskSortOrderDto } from '../types/task'

export type BoardFilters = {
    runDate?: string
    savedViewId?: string
    q?: string
    priorityMin?: number
    statuses?: string[]
}

export function useBoard(workspaceId: string, opts: BoardFilters) {
    return useQuery({
        queryKey: ['board', workspaceId, opts],
        enabled: Boolean(workspaceId),
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (opts.runDate) qs.set('runDate', opts.runDate)
            if (opts.savedViewId) qs.set('savedViewId', opts.savedViewId)
            if (opts.q) qs.set('q', opts.q)
            if (opts.priorityMin) qs.set('priorityMin', opts.priorityMin.toString())
            if (opts.statuses?.length) opts.statuses.forEach(s => qs.append('statuses', s))

            const url = `/v1/workspaces/${workspaceId}/board${qs.toString() ? `?${qs.toString()}` : ''}`
            const r = await apiGet<BoardResponse>(url)
            return r.data
        },
    })
}

export function useCreateTask(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dto: CreateTaskDto) => {
            const r = await apiPost('/v1/tasks', { ...dto, workspaceId })
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        },
    })
}

export function useUpdateTask(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: UpdateTaskDto }) => {
            const r = await apiPatch(`/v1/tasks/${id}`, dto)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        },
    })
}

export function useUpdateTaskSortOrder(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dto: BatchUpdateTaskSortOrderDto) => {
            const r = await apiPut('/v1/tasks/sort-order', dto)
            return r.data
        },
        onSuccess: () => {
            // Optimistic update often preferred, but simple invalidation for now
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        },
    })
}
