import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '../lib/http'

export interface RecurrenceTemplate {
    id: string
    workspaceId: string
    title: string
    description?: string
    statusDefault: string
    priority: number
    cadence: string
    isActive: boolean
    createdAt: string
}

export interface CreateRecurrenceTemplateDto {
    title: string
    description?: string
    statusDefault?: string
    priority?: number
    cadence?: 'daily'
    isActive?: boolean
}

export function useRecurrenceTemplates(workspaceId: string) {
    return useQuery({
        queryKey: ['recurrence-templates', workspaceId],
        enabled: Boolean(workspaceId),
        queryFn: async () => {
            const r = await apiGet<RecurrenceTemplate[]>(`/v1/workspaces/${workspaceId}/recurrence-templates`)
            return r.data
        },
    })
}

export function useCreateRecurrenceTemplate(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dto: CreateRecurrenceTemplateDto) => {
            const r = await apiPost(`/v1/workspaces/${workspaceId}/recurrence-templates`, dto)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurrence-templates', workspaceId] })
            // Also invalidate board if we expect immediate feedback (though daily runs are async/cron)
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        },
    })
}

export function useRunDaily(workspaceId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dto: { runDate?: string }) => {
            const r = await apiPost(`/v1/workspaces/${workspaceId}/daily-runs/run`, dto)
            return r.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', workspaceId] })
        }
    })
}
