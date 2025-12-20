import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { BoardModel } from './models/board.model';
import { BoardColumnModel } from './models/board-column.model';
import { TaskModel } from '../task/models/task.model';

type ColumnRow = {
    id: string;
    key: string;
    title: string;
    sortOrder: number;
};

type TaskRow = {
    id: string;
    workspaceId: string;
    status: string;
    title: string;
    description: string | null;
    priority: number;
    dueDate: string | null;
    sortOrder: number;
    templateId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

@Injectable()
export class BoardService {
    constructor(private readonly prisma: PrismaService) { }

    private async assertWorkspaceExists(workspaceId: string): Promise<void> {
        const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(select 1 from tg_workspace where id = ${workspaceId}::uuid) as "exists"
    `;
        if (!ws[0]?.exists) throw new WorkspaceNotFoundException();
    }

    private mapTask(r: TaskRow): TaskModel {
        return {
            id: r.id,
            workspaceId: r.workspaceId,
            status: r.status,
            title: r.title,
            description: r.description ?? undefined,
            priority: r.priority,
            dueDate: r.dueDate ?? undefined,
            sortOrder: r.sortOrder,
            templateId: r.templateId ?? undefined,
            createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined
        };
    }

    async getBoard(workspaceId: string, runDate?: string): Promise<BoardModel> {
        await this.assertWorkspaceExists(workspaceId);

        const columns = await this.prisma.$queryRaw<ColumnRow[]>`
      select
        id::text as id,
        key::text as key,
        title,
        sort_order::int as "sortOrder"
      from tg_column
      where workspace_id = ${workspaceId}::uuid
      order by sort_order asc
    `;

        const tasks = await this.prisma.$queryRaw<TaskRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        status::text as status,
        title,
        description,
        priority::int as priority,
        due_date::text as "dueDate",
        sort_order::int as "sortOrder",
        template_id::text as "templateId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_task
      where workspace_id = ${workspaceId}::uuid
        and (
          (${runDate ?? null}::date is null and due_date is null)
          or
          (${runDate ?? null}::date is not null and (due_date = ${runDate ?? null}::date or due_date is null))
        )
      order by
        case status::text
          when 'todo' then 1
          when 'in_progress' then 2
          when 'blocked' then 3
          when 'done' then 4
          else 99
        end asc,
        sort_order asc,
        created_at asc
    `;

        const tasksByStatus = new Map<string, TaskModel[]>();
        for (const t of tasks) {
            const key = t.status;
            const arr = tasksByStatus.get(key) ?? [];
            arr.push(this.mapTask(t));
            tasksByStatus.set(key, arr);
        }

        const boardColumns: BoardColumnModel[] = columns.map((c) => ({
            id: c.id,
            key: c.key,
            title: c.title,
            sortOrder: c.sortOrder,
            tasks: tasksByStatus.get(c.key) ?? []
        }));

        return {
            workspaceId,
            runDate: runDate ?? undefined,
            columns: boardColumns
        };
    }
}
