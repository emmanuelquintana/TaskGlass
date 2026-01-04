export type BoardColumn = {
    id: string
    key: string            // todo | in_progress | blocked | done
    title: string
    sortOrder: number
    tasks: BoardTask[]
}

export type BoardTag = {
    id: string
    name: string
    color?: string | null
}

export type BoardTask = {
    id: string
    title: string
    description?: string
    status: string
    priority?: number
    dueDate?: string
    sortOrder?: number
    templateId?: string | null
    tags?: BoardTag[]
}

export type BoardResponse = {
    workspaceId: string
    runDate?: string
    columns: BoardColumn[]
    // tasks: BoardTask[] // Removed because tasks are now nested in columns
    savedView?: { id: string; name: string } | null
}

export type Board = BoardResponse
