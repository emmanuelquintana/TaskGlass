import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationMetadata } from '../../common/response/pagination-metadata';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { TaskNotFoundException } from './errors/task-not-found.exception';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusDto } from './dto/task-status.dto';
import { TaskModel } from './models/task.model';

type TaskRow = {
  id: string;
  workspaceId: string;
  status: string;
  title: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * TaskService provides CRUD operations for tg_task.
 * It assumes tg_task has at least: id, workspace_id, status(tg_task_status), title, description, created_at, updated_at.
 */
@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(r: TaskRow): TaskModel {
    return {
      id: r.id,
      workspaceId: r.workspaceId,
      status: r.status,
      title: r.title,
      description: r.description ?? undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined
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
        id::text as id,
        workspace_id::text as "workspaceId",
        status::text as status,
        title,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_task
      where workspace_id = ${workspaceId}::uuid
        and (${status}::text is null or status = ${status}::tg_task_status)
        and (${q} = '' or title ilike ('%' || ${q} || '%'))
      order by created_at desc
      limit ${size}
      offset ${offset}
    `;

    const items = rows.map((r) => this.mapRow(r));
    return { items, metadata: new PaginationMetadata(page, size, total) };
  }

  async getById(id: string): Promise<TaskModel> {
    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        status::text as status,
        title,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_task
      where id = ${id}::uuid
      limit 1
    `;

    const found = rows[0];
    if (!found) throw new TaskNotFoundException();
    return this.mapRow(found);
  }

  async create(workspaceId: string, dto: CreateTaskDto): Promise<TaskModel> {
    await this.assertWorkspaceExists(workspaceId);

    const status = dto.status ?? 'todo';

    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      insert into tg_task (workspace_id, status, title, description)
      values (
        ${workspaceId}::uuid,
        ${status}::tg_task_status,
        ${dto.title},
        ${dto.description ?? null}
      )
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        status::text as status,
        title,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return this.mapRow(rows[0]);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskModel> {
    const rows = await this.prisma.$queryRaw<TaskRow[]>`
      update tg_task
      set
        title = coalesce(${dto.title ?? null}, title),
        description = coalesce(${dto.description ?? null}, description),
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
}
