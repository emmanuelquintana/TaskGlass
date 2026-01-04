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

export async function apiGet<T>(path: string): Promise<ApiEnvelope<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { accept: 'application/json' },
    })

    const json = (await res.json()) as ApiEnvelope<T>

    // Si tu backend siempre responde envelope, aquí basta con validar status
    if (!res.ok) {
        // No exponemos detalles sensibles; el traceId lo tienes para buscar logs
        throw new Error(`${json.code}: ${json.message} (traceId=${json.traceId})`)
    }

    return json
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
    })
    const json = (await res.json()) as ApiEnvelope<T>
    if (!res.ok) throw new Error(`${json.code}: ${json.message} (traceId=${json.traceId})`)
    return json
}

export async function apiPatch<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
    })
    const json = (await res.json()) as ApiEnvelope<T>
    if (!res.ok) throw new Error(`${json.code}: ${json.message} (traceId=${json.traceId})`)
    return json
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
    })
    const json = (await res.json()) as ApiEnvelope<T>
    if (!res.ok) throw new Error(`${json.code}: ${json.message} (traceId=${json.traceId})`)
    return json
}
