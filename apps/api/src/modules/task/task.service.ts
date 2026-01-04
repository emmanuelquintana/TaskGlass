import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationMetadata } from '../../common/response/pagination-metadata';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { TaskNotFoundException } from './errors/task-not-found.exception';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusDto } from './dto/task-status.dto';
import { TaskModel } from './models/task.model';
import { BatchUpdateTaskSortOrderDto } from './dto/batch-update-task-sort-order.dto';
import { BatchUpdateTaskSortOrderResultModel } from './models/batch-update-task-sort-order-result.model';
import { TaskSortOrderUpdateModel } from './models/task-sort-order-update.model';

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
  tags: any; // JSON
};
/**
 * TaskService provides CRUD operations for tg_task.
 * It assumes tg_task has at least: id, workspace_id, status(tg_task_status), title, description, created_at, updated_at.
 */
@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

  private mapRow(r: TaskRow): TaskModel {
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
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
      tags: r.tags || []
    };
  }
  private async assertWorkspaceExists(workspaceId: string): Promise<void> {
    const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_workspace
        where id = ${workspaceId}::uuid
          and deleted_at is null
      ) as "exists"
    `;
    if (!ws[0]?.exists) throw new WorkspaceNotFoundException();
  }

  async listByWorkspace(
    workspaceId: string,
    opts: { status?: string; q?: string; page: number; size: number }
  ): Promise<{ items: TaskModel[]; metadata: PaginationMetadata }> {
    await this.assertWorkspaceExists(workspaceId);

    const status = opts.status ?? null;
    const q = (opts.q ?? '').trim();
    const page = opts.page ?? 0;
    const size = opts.size ?? 50;
    const offset = page * size;

    const countRows = await this.prisma.$queryRaw<{ total: number }[]>`
      select count(*)::int as total
      from tg_task
      where workspace_id = ${workspaceId}::uuid
        and (${status}::text is null or status = ${status}::tg_task_status)
        and (${q} = '' or title ilike ('%' || ${q} || '%'))
    `;
    const total = countRows[0]?.total ?? 0;

    const rows = await this.prisma.$queryRaw<TaskRow[]>`
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
    t.updated_at as "updatedAt",
    coalesce(
        (
            select json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
            from tg_task_tag tt
            join tg_tag tg on tg.id = tt.tag_id
            where tt.task_id = t.id
        ),
        '[]'::json
    ) as tags
  from tg_task t
  where t.workspace_id = ${workspaceId}::uuid
    and (${status}::text is null or t.status = ${status}::tg_task_status)
    and (${q} = '' or t.title ilike ('%' || ${q} || '%'))
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
  limit ${size}
  offset ${offset}
`;


    const items = rows.map((r) => this.mapRow(r));
    return { items, metadata: new PaginationMetadata(page, size, total) };
  }

  async getById(id: string): Promise<TaskModel> {
    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      select
        t.id::text as id,
        t.workspace_id::text as "workspaceId",
        t.status::text as status,
        t.title,
        t.description,
        t.priority::int as priority,
        t.due_date::text as "dueDate",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
         coalesce(
            (
                select json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
                from tg_task_tag tt
                join tg_tag tg on tg.id = tt.tag_id
                where tt.task_id = t.id
            ),
            '[]'::json
        ) as tags
      from tg_task t
      where t.id = ${id}::uuid
      limit 1
    `;

    const found = rows[0];
    if (!found) throw new TaskNotFoundException();
    return this.mapRow(found);
  }

  async create(workspaceId: string, dto: CreateTaskDto): Promise<TaskModel> {
    await this.assertWorkspaceExists(workspaceId);

    const status = dto.status ?? 'todo';
    const priority = dto.priority ?? 0;
    const dueDate = dto.dueDate ?? null;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Task
      const rows = await tx.$queryRaw<TaskRow[]>`
        insert into tg_task (workspace_id, status, title, description, priority, due_date)
        values (
            ${workspaceId}::uuid,
            ${status}::tg_task_status,
            ${dto.title},
            ${dto.description ?? null},
            ${priority},
            ${dueDate}
        )
        returning
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
            updated_at as "updatedAt",
            '[]'::json as tags
        `;
      const newTask = rows[0];

      // 2. Insert Tags if Present
      const insertedTags: any[] = [];
      if (dto.tagIds && dto.tagIds.length > 0) {
        const uniqueTags = [...new Set(dto.tagIds)];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const rawTagValue of uniqueTags) {
          let tagIdToLink = rawTagValue;

          // Parse "Name:Color" or just "Name"
          let tagName = rawTagValue;
          let tagColor = '#6b7280';

          if (rawTagValue.includes(':')) {
            const parts = rawTagValue.split(':');
            if (parts.length === 2) {
              tagName = parts[0];
              tagColor = parts[1];
            }
          }

          // If standard UUID, we treat it as ID (ignoring color override for existing tags for now)
          if (!uuidRegex.test(tagName)) {
            // It's a name, find or create
            // Check if exists
            const existing = await tx.$queryRaw<{ id: string, name: string, color: string }[]>`
                select id, name, color from tg_tag 
                where name = ${tagName} 
                  and workspace_id = ${workspaceId}::uuid
                limit 1
            `;

            if (existing[0]) {
              tagIdToLink = existing[0].id;
              insertedTags.push(existing[0]);
            } else {
              // Create new tag
              const newTagRows = await tx.$queryRaw<{ id: string, name: string, color: string }[]>`
                    insert into tg_tag (workspace_id, name, group_key, color)
                    values (
                        ${workspaceId}::uuid, 
                        ${tagName}, 
                        'general', 
                        ${tagColor}
                    )
                    on conflict (workspace_id, group_key, name) do update set updated_at = now()
                    returning id::text, name, color
                `;

              if (newTagRows[0]) {
                tagIdToLink = newTagRows[0].id;
                insertedTags.push(newTagRows[0]);
              } else {
                const retry = await tx.$queryRaw<{ id: string, name: string, color: string }[]>`
                        select id, name, color from tg_tag 
                        where name = ${tagName} 
                          and workspace_id = ${workspaceId}::uuid
                        limit 1
                    `;
                if (retry[0]) {
                  tagIdToLink = retry[0].id;
                  insertedTags.push(retry[0]);
                }
              }
            }
          } else {
            // It was a UUID, just verify/link it. 
            tagIdToLink = tagName;
            // We can't easily push to insertedTags without fetching, but we'll assume it exists
          }

          if (uuidRegex.test(tagIdToLink)) {
            await tx.$executeRaw`
                insert into tg_task_tag (task_id, tag_id)
                values (${newTask.id}::uuid, ${tagIdToLink}::uuid)
                on conflict do nothing
             `;
          }
        }
      }
      newTask.tags = insertedTags;

      return this.mapRow(newTask);
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskModel> {
    const priority = dto.priority !== undefined ? dto.priority : null;
    const dueDate = dto.dueDate !== undefined ? dto.dueDate : null;

    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      update tg_task t
      set
        title = coalesce(${dto.title ?? null}, title),
        description = coalesce(${dto.description ?? null}, description),
        status = coalesce(${dto.status}::tg_task_status, status),
        priority = coalesce(${priority}, priority),
        due_date = coalesce(${dueDate}, due_date),
        updated_at = now()
      where id = ${id}::uuid
      returning
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
        t.updated_at as "updatedAt",
        (
            select json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
            from tg_task_tag tt
            join tg_tag tg on tg.id = tt.tag_id
            where tt.task_id = t.id
        ) as tags
    `;

    const updated = rows[0];
    if (!updated) throw new TaskNotFoundException();
    return this.mapRow(updated);
  }

  async updateStatus(id: string, dto: TaskStatusDto): Promise<TaskModel> {
    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      update tg_task
      set
        status = ${dto.status}::tg_task_status,
        updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        status::text as status,
        title,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const updated = rows[0];
    if (!updated) throw new TaskNotFoundException();
    return this.mapRow(updated);
  }

  async remove(id: string): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      delete from tg_task
      where id = ${id}::uuid
      returning id::text as id
    `;

    const removed = rows[0];
    if (!removed) throw new TaskNotFoundException();
    return { id: removed.id };
  }

  async updateSortOrderBatch(dto: BatchUpdateTaskSortOrderDto): Promise<BatchUpdateTaskSortOrderResultModel> {
    await this.assertWorkspaceExists(dto.workspaceId);

    if (!dto.items?.length) {
      return { workspaceId: dto.workspaceId, updated: 0, items: [] };
    }

    const payload = JSON.stringify(
      dto.items.map((i) => ({
        id: i.id,
        sort_order: i.sortOrder,
        status: i.status ?? null
      }))
    );

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        { id: string; sortOrder: number; status: string }[]
      >`
        with input as (
          select *
          from jsonb_to_recordset(${payload}::jsonb)
            as x(id uuid, sort_order int, status text)
        )
        update tg_task t
        set
          sort_order = i.sort_order,
          status = coalesce(i.status::tg_task_status, t.status),
          updated_at = now()
        from input i
        where t.id = i.id
          and t.workspace_id = ${dto.workspaceId}::uuid
        returning
          t.id::text as id,
          t.sort_order::int as "sortOrder",
          t.status::text as status
      `;

      const items: TaskSortOrderUpdateModel[] = rows.map((r) => ({
        id: r.id,
        sortOrder: r.sortOrder,
        status: r.status
      }));

      return {
        workspaceId: dto.workspaceId,
        updated: items.length,
        items
      };
    });
  }
}
