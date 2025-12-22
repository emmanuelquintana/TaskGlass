export type BoardColumn = {
    key: string            // todo | in_progress | blocked | done
    title: string
    sortOrder: number
}

export type BoardTask = {
    id: string
    title: string
    description?: string
    status: string
    priority?: number
    dueDate?: string
    sortOrder?: number
    tags?: { id: string; name: string; color?: string }[]
}

export type BoardResponse = {
    workspaceId: string
    runDate?: string
    columns: BoardColumn[]
    tasks: BoardTask[]
    savedView?: { id: string; name: string } | null
}
