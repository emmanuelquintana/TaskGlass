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
