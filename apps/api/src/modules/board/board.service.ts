import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BoardModel } from './models/board.model';
import { BoardColumnModel } from './models/board-column.model';
import { BoardTaskModel } from './models/board-task.model';
import { BoardTagModel } from './models/board-tag.model';
import { BoardWorkspaceNotFoundException } from './errors/board-workspace-not-found.exception';

type ExistsRow = { exists: boolean };

type ColumnRow = {
    id: string;
    key: string;
    title: string;
    sortOrder: number;
};

type TaskRow = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: number;
    dueDate: string | null;
    sortOrder: number;
    templateId: string | null;
    tags: any; // jsonb aggregated
};

/**
 * BoardService returns an aggregated view for rendering a Kanban board.
 */
@Injectable()
export class BoardService {
    constructor(private readonly prisma: PrismaService) { }

    private async assertWorkspaceExists(workspaceId: string): Promise<void> {
        const ws = await this.prisma.$queryRaw<ExistsRow[]>`
      select exists(
        select 1 from tg_workspace
        where id = ${workspaceId}::uuid
      ) as "exists"
    `;
        if (!ws[0]?.exists) throw new BoardWorkspaceNotFoundException();
    }

    async getBoard(workspaceId: string, date?: string): Promise<BoardModel> {
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

        const tasks = date
            ? await this.prisma.$queryRaw<TaskRow[]>`
          select
            t.id::text as id,
            t.title,
            t.description,
            t.status::text as status,
            t.priority::int as priority,
            t.due_date::text as "dueDate",
            t.sort_order::int as "sortOrder",
            t.template_id::text as "templateId",
            coalesce(
              jsonb_agg(
                distinct jsonb_build_object(
                  'id', g.id::text,
                  'groupKey', g.group_key,
                  'name', g.name,
                  'color', g.color
                )
              ) filter (where g.id is not null),
              '[]'::jsonb
            ) as tags
          from tg_task t
          left join tg_task_tag tt on tt.task_id = t.id
          left join tg_tag g on g.id = tt.tag_id
          where t.workspace_id = ${workspaceId}::uuid
            and t.due_date = ${date}::date
          group by t.id
          order by t.status asc, t.sort_order asc, t.created_at asc
        `
            : await this.prisma.$queryRaw<TaskRow[]>`
          select
            t.id::text as id,
            t.title,
            t.description,
            t.status::text as status,
            t.priority::int as priority,
            t.due_date::text as "dueDate",
            t.sort_order::int as "sortOrder",
            t.template_id::text as "templateId",
            coalesce(
              jsonb_agg(
                distinct jsonb_build_object(
                  'id', g.id::text,
                  'groupKey', g.group_key,
                  'name', g.name,
                  'color', g.color
                )
              ) filter (where g.id is not null),
              '[]'::jsonb
            ) as tags
          from tg_task t
          left join tg_task_tag tt on tt.task_id = t.id
          left join tg_tag g on g.id = tt.tag_id
          where t.workspace_id = ${workspaceId}::uuid
          group by t.id
          order by t.status asc, t.sort_order asc, t.created_at asc
        `;

        const mappedColumns: BoardColumnModel[] = columns.map((c) => ({
            id: c.id,
            key: c.key,
            title: c.title,
            sortOrder: c.sortOrder
        }));

        const mappedTasks: BoardTaskModel[] = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            sortOrder: t.sortOrder,
            templateId: t.templateId,
            tags: (Array.isArray(t.tags) ? t.tags : []) as BoardTagModel[]
        }));

        return {
            workspaceId,
            date,
            columns: mappedColumns,
            tasks: mappedTasks
        };
    }
}
