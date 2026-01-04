export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: 'todo' | 'doing' | 'blocked' | 'done';
    workspaceId?: string;
    priority?: number;
    dueDate?: string;
    tagIds?: string[];
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: 'todo' | 'doing' | 'blocked' | 'done';
    priority?: number;
}

export interface BatchUpdateTaskSortOrderDto {
    workspaceId: string;
    items: { id: string; sortOrder: number }[];
}
