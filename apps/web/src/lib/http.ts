import { toastService } from './toast-service'

export type ApiEnvelope<T> = {
    code: string
    message: string
    traceId: string
    data: T
    metadata?: {
        page: number
        size: number
        elements: number
    }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

// Funcionalidad central para manejo de fetch
async function apiFetch<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown,
): Promise<ApiEnvelope<T>> {
    try {
        const options: RequestInit = {
            method,
            headers: {
                accept: 'application/json',
            },
        }

        if (body) {
            options.body = JSON.stringify(body)
            // @ts-ignore
            options.headers['Content-Type'] = 'application/json'
        }

        const res = await fetch(`${API_BASE}${endpoint}`, options)

        let json: ApiEnvelope<T> | null = null
        try {
            const text = await res.text()
            if (text) {
                json = JSON.parse(text)
            }
        } catch (e) {
        }

        if (!res.ok) {
            const errorMsg = json?.message || `Error ${res.status}: ${res.statusText}`
            const errorCode = json?.code || 'HTTP_ERROR'
            const traceId = json?.traceId || 'no-trace'

            toastService.error(errorMsg)
            throw new Error(`${errorCode}: ${errorMsg} (traceId=${traceId})`)
        }

        if (!json) {
            return {
                code: 'SUCCESS',
                message: 'Operation completed successfully',
                traceId: 'no-trace',
                data: null as T,
            }
        }

        if (method !== 'GET') {
            toastService.success(json.message || 'Operation successful')
        }

        return json
    } catch (error: unknown) {
        const err = error as Error
        const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
        if (isNetworkError || err.message === 'Failed to fetch') {
            toastService.error('Could not connect to server. Please check your connection.')
        } else if (!err.message.includes('(traceId=')) {
            toastService.error(err.message || 'Unknown error occurred')
        }

        throw err
    }
}

export function apiGet<T>(path: string) {
    return apiFetch<T>(path, 'GET')
}

export function apiPost<T>(path: string, body: unknown) {
    return apiFetch<T>(path, 'POST', body)
}

export function apiPut<T>(path: string, body: unknown) {
    return apiFetch<T>(path, 'PUT', body)
}

export function apiPatch<T>(path: string, body: unknown) {
    return apiFetch<T>(path, 'PATCH', body)
}

export function apiDelete<T>(path: string) {
    return apiFetch<T>(path, 'DELETE')
}
