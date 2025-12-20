import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { BoardModel } from './models/board.model';
import { BoardColumnModel } from './models/board-column.model';
import { BoardTaskModel } from './models/board-task.model';
import { BoardTagModel } from './models/board-tag.model';

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
    tags: any;
};


type SavedViewRow = {
    id: string;
    workspaceId: string;
    filters: unknown;
    sort: unknown;
};

type SavedViewFilters = {
    q?: string;
    statuses?: string[];
    priorityMin?: number;
    priorityMax?: number;
    tagIds?: string[];
    includeBacklog?: boolean;
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

    private normalizeTags(tags: any): BoardTagModel[] {
        if (Array.isArray(tags)) return tags as BoardTagModel[];
        if (tags && typeof tags === 'object' && Array.isArray(tags?.value)) return tags.value as BoardTagModel[];
        return [];
    }

    private normalizeFilters(raw: unknown): SavedViewFilters {
        const obj = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
        const q = typeof obj.q === 'string' ? obj.q.trim() : '';
        const statuses = Array.isArray(obj.statuses) ? obj.statuses.filter((s) => typeof s === 'string') as string[] : undefined;
        const priorityMin = typeof obj.priorityMin === 'number' ? obj.priorityMin : undefined;
        const priorityMax = typeof obj.priorityMax === 'number' ? obj.priorityMax : undefined;
        const tagIds = Array.isArray(obj.tagIds) ? obj.tagIds.filter((s) => typeof s === 'string') as string[] : undefined;
        const includeBacklog = typeof obj.includeBacklog === 'boolean' ? obj.includeBacklog : true;

        const allowed = new Set(['todo', 'in_progress', 'blocked', 'done']);
        const statusesClean = statuses?.filter((s) => allowed.has(s)) ?? undefined;

        return {
            q,
            statuses: statusesClean?.length ? statusesClean : undefined,
            priorityMin,
            priorityMax,
            tagIds: tagIds?.length ? tagIds : undefined,
            includeBacklog
        };
    }


    async getBoard(workspaceId: string, runDate?: string, savedViewId?: string): Promise<BoardModel> {
        await this.assertWorkspaceExists(workspaceId);

        let filters: SavedViewFilters = { includeBacklog: true, q: '' };
        if (savedViewId) {
            const sv = await this.loadSavedView(workspaceId, savedViewId);
            filters = this.normalizeFilters(sv.filters);
        }

        const q = filters.q ?? '';
        const statuses = filters.statuses ?? null;
        const priorityMin = filters.priorityMin ?? null;
        const priorityMax = filters.priorityMax ?? null;
        const tagIds = filters.tagIds ?? null;
        const includeBacklog = filters.includeBacklog ?? true;

        // Columns (igual que ya lo tienes)
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

        // Tasks + Tags, ahora con filtros por savedView
        const tasks = await this.prisma.$queryRaw<TaskRow[]>`
    select
      t.id::text as id,
      t.workspace_id::text as "workspaceId",
      t.status::text as status,
      t.title,
      t.description,
      t.priority::int as priority,
      t.due_date::text as "dueDate",
      t.sort_order::int as "sortOrder",
      t.template_id::text as "templateId",
      t.created_at as "createdAt",
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

      -- board date mode (runDate + backlog)
      and (
        (${runDate ?? null}::date is null and t.due_date is null)
        or
        (${runDate ?? null}::date is not null and (
          t.due_date = ${runDate ?? null}::date
          or (${includeBacklog}::boolean = true and t.due_date is null)
        ))
      )

      -- saved view filters
      and (${q} = '' or (t.title ilike ('%' || ${q} || '%') or coalesce(t.description,'') ilike ('%' || ${q} || '%')))

      and (${statuses}::text[] is null or t.status = any(${statuses}::tg_task_status[]))

      and (${priorityMin}::int is null or t.priority >= ${priorityMin}::int)
      and (${priorityMax}::int is null or t.priority <= ${priorityMax}::int)

      and (
        ${tagIds}::uuid[] is null
        or exists (
          select 1
          from tg_task_tag ttt
          where ttt.task_id = t.id
            and ttt.tag_id = any(${tagIds}::uuid[])
        )
      )

    group by
      t.id, t.workspace_id, t.status, t.title, t.description, t.priority,
      t.due_date, t.sort_order, t.template_id, t.created_at

    order by
      case t.status::text
        when 'todo' then 1
        when 'in_progress' then 2
        when 'blocked' then 3
        when 'done' then 4
        else 99
      end asc,
      t.sort_order asc,
      t.created_at asc
  `;

        const tasksByStatus = new Map<string, BoardTaskModel[]>();

        for (const t of tasks) {
            const mapped: BoardTaskModel = {
                id: t.id,
                workspaceId: t.workspaceId,
                status: t.status,
                title: t.title,
                description: t.description,
                priority: t.priority,
                dueDate: t.dueDate,
                sortOrder: t.sortOrder,
                templateId: t.templateId,
                tags: this.normalizeTags(t.tags)
            };

            const arr = tasksByStatus.get(mapped.status) ?? [];
            arr.push(mapped);
            tasksByStatus.set(mapped.status, arr);
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

    private async loadSavedView(workspaceId: string, savedViewId: string): Promise<SavedViewRow> {
        const rows = await this.prisma.$queryRaw<SavedViewRow[]>`
    select
      id::text as id,
      workspace_id::text as "workspaceId",
      filters,
      sort
    from tg_saved_view
    where id = ${savedViewId}::uuid
      and workspace_id = ${workspaceId}::uuid
    limit 1
  `;
        const row = rows[0];
        if (!row) {
            throw new (require('../saved-view/errors/saved-view-not-found.exception').SavedViewNotFoundException)();
        }
        return row;
    }

}
