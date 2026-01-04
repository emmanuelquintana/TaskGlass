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

        // 1. Manejar respuestas no-JSON (e.g. 502 Bad Gateway HTML, o vacías)
        let json: ApiEnvelope<T> | null = null
        try {
            const text = await res.text()
            if (text) {
                json = JSON.parse(text)
            }
        } catch (e) {
            // No es JSON válido, probablemente un error del servidor (nginx 500 html, etc)
        }

        // 2. Errores HTTP (status != 2xx)
        if (!res.ok) {
            const errorMsg = json?.message || `Error ${res.status}: ${res.statusText}`
            const errorCode = json?.code || 'HTTP_ERROR'
            const traceId = json?.traceId || 'no-trace'

            toastService.error(errorMsg)
            throw new Error(`${errorCode}: ${errorMsg} (traceId=${traceId})`)
        }

        // 3. Éxito
        // Si no hay body de respuesta pero fue 200/204, devolvemos algo genérico
        if (!json) {
            return {
                code: 'SUCCESS',
                message: 'Operation completed successfully',
                traceId: 'no-trace',
                data: null as T,
            }
        }

        // Éxito con mutaciones -> Toast automático
        if (method !== 'GET') {
            toastService.success(json.message || 'Operation successful')
        }

        return json
    } catch (error: any) {
        // 4. Errores de Red / Sin conexión (fetch throws TypeError)
        // Ya lanzamos Error arriba para !res.ok, así que verificamos si ya fue manejado (si mostramos toast)
        // O si es un error nativo de fetch

        // Si es nuestro error lanzado arriba, ya tuvo toast.
        // Si es TypeError de fetch (Failed to fetch), no tuvo toast.

        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        if (isNetworkError || error.message === 'Failed to fetch') {
            toastService.error('Could not connect to server. Please check your connection.')
        } else if (!error.message.includes('(traceId=')) {
            // Error desconocido que no vino de nuestro throw anterior
            toastService.error(error.message || 'Unknown error occurred')
        }

        // Re-lanzar para que el componente que llamó pueda saber que falló
        throw error
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
