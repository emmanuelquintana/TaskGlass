import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { TaskNotFoundException } from '../task/errors/task-not-found.exception';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ListTagsQueryDto } from './dto/list-tags.query.dto';
import { ReplaceTaskTagsDto } from './dto/replace-task-tags.dto';
import { TagModel } from './models/tag.model';
import { TagNotFoundException } from './errors/tag-not-found.exception';
import { TagAlreadyExistsException } from './errors/tag-already-exists.exception';
import { TaskTagWorkspaceMismatchException } from './errors/task-tag-workspace-mismatch.exception';

type TagRow = {
  id: string;
  workspaceId: string;
  groupKey: string;
  name: string;
  color: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * TagService provides CRUD for tg_tag and task-tag assignment via tg_task_tag.
 */
@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTag(r: TagRow): TagModel {
    return {
      id: r.id,
      workspaceId: r.workspaceId,
      groupKey: r.groupKey,
      name: r.name,
      color: r.color ?? undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined
    };
  }

  private async assertWorkspaceExists(workspaceId: string): Promise<void> {
    const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_workspace
        where id = ${workspaceId}::uuid
      ) as "exists"
    `;
    if (!ws[0]?.exists) throw new WorkspaceNotFoundException();
  }

  private async assertTaskExists(taskId: string): Promise<void> {
    const rows = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_task
        where id = ${taskId}::uuid
      ) as "exists"
    `;
    if (!rows[0]?.exists) throw new TaskNotFoundException();
  }

  private async getTagRowById(id: string): Promise<TagRow | null> {
    const rows = await this.prisma.$queryRaw<TagRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        group_key as "groupKey",
        name,
        color,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_tag
      where id = ${id}::uuid
      limit 1
    `;
    return rows[0] ?? null;
  }

  async listByWorkspace(workspaceId: string, q: ListTagsQueryDto): Promise<TagModel[]> {
    await this.assertWorkspaceExists(workspaceId);

    const groupKey = (q.groupKey ?? '').trim();
    const search = (q.q ?? '').trim();

    const rows = await this.prisma.$queryRaw<TagRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        group_key as "groupKey",
        name,
        color,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_tag
      where workspace_id = ${workspaceId}::uuid
        and (${groupKey} = '' or group_key = ${groupKey})
        and (${search} = '' or name ilike ('%' || ${search} || '%'))
      order by group_key asc, name asc
    `;

    return rows.map((r) => this.mapTag(r));
  }

  async create(workspaceId: string, dto: CreateTagDto): Promise<TagModel> {
    await this.assertWorkspaceExists(workspaceId);

    const exists = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_tag
        where workspace_id = ${workspaceId}::uuid
          and group_key = ${dto.groupKey}
          and name = ${dto.name}
      ) as "exists"
    `;
    if (exists[0]?.exists) throw new TagAlreadyExistsException();

    const rows = await this.prisma.$queryRaw<TagRow[]>`
      insert into tg_tag (workspace_id, group_key, name, color)
      values (
        ${workspaceId}::uuid,
        ${dto.groupKey},
        ${dto.name},
        ${dto.color ?? null}
      )
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        group_key as "groupKey",
        name,
        color,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return this.mapTag(rows[0]);
  }

  async getById(id: string): Promise<TagModel> {
    const row = await this.getTagRowById(id);
    if (!row) throw new TagNotFoundException();
    return this.mapTag(row);
  }

  async update(id: string, dto: UpdateTagDto): Promise<TagModel> {
    const current = await this.getTagRowById(id);
    if (!current) throw new TagNotFoundException();

    const nextGroupKey = dto.groupKey ?? current.groupKey;
    const nextName = dto.name ?? current.name;

    const exists = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_tag
        where workspace_id = ${current.workspaceId}::uuid
          and group_key = ${nextGroupKey}
          and name = ${nextName}
          and id <> ${id}::uuid
      ) as "exists"
    `;
    if (exists[0]?.exists) throw new TagAlreadyExistsException();

    const rows = await this.prisma.$queryRaw<TagRow[]>`
      update tg_tag
      set
        group_key = coalesce(${dto.groupKey ?? null}, group_key),
        name = coalesce(${dto.name ?? null}, name),
        color = coalesce(${dto.color ?? null}, color),
        updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        group_key as "groupKey",
        name,
        color,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return this.mapTag(rows[0]);
  }

  async remove(id: string): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      delete from tg_tag
      where id = ${id}::uuid
      returning id::text as id
    `;

    const removed = rows[0];
    if (!removed) throw new TagNotFoundException();
    return { id: removed.id };
  }

  async listTagsByTask(taskId: string): Promise<TagModel[]> {
    await this.assertTaskExists(taskId);

    const rows = await this.prisma.$queryRaw<TagRow[]>`
      select
        t.id::text as id,
        t.workspace_id::text as "workspaceId",
        t.group_key as "groupKey",
        t.name,
        t.color,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt"
      from tg_task_tag tt
      join tg_tag t on t.id = tt.tag_id
      where tt.task_id = ${taskId}::uuid
      order by t.group_key asc, t.name asc
    `;

    return rows.map((r) => this.mapTag(r));
  }

  private async assertSameWorkspace(taskId: string, tagId: string): Promise<void> {
    const rows = await this.prisma.$queryRaw<{ ok: boolean }[]>`
      select exists (
        select 1
        from tg_task ta
        join tg_tag tg on tg.workspace_id = ta.workspace_id
        where ta.id = ${taskId}::uuid
          and tg.id = ${tagId}::uuid
      ) as ok
    `;
    if (!rows[0]?.ok) throw new TaskTagWorkspaceMismatchException();
  }

  async attachTagToTask(taskId: string, tagId: string): Promise<{ taskId: string; tagId: string }> {
    await this.assertTaskExists(taskId);

    const tag = await this.getTagRowById(tagId);
    if (!tag) throw new TagNotFoundException();

    await this.assertSameWorkspace(taskId, tagId);

    await this.prisma.$queryRaw`
      insert into tg_task_tag (task_id, tag_id)
      values (${taskId}::uuid, ${tagId}::uuid)
      on conflict (task_id, tag_id) do nothing
    `;

    return { taskId, tagId };
  }

  async detachTagFromTask(taskId: string, tagId: string): Promise<{ taskId: string; tagId: string }> {
    await this.assertTaskExists(taskId);

    const tag = await this.getTagRowById(tagId);
    if (!tag) throw new TagNotFoundException();

    await this.prisma.$queryRaw`
      delete from tg_task_tag
      where task_id = ${taskId}::uuid
        and tag_id = ${tagId}::uuid
    `;

    return { taskId, tagId };
  }

  async replaceTaskTags(taskId: string, dto: ReplaceTaskTagsDto): Promise<TagModel[]> {
    await this.assertTaskExists(taskId);

    if (dto.tagIds.length > 0) {
      const okRows = await this.prisma.$queryRaw<{ ok: boolean }[]>`
        select (
          select count(*)::int
          from tg_tag
          where id = any(${dto.tagIds}::uuid[])
        ) = ${dto.tagIds.length}::int as ok
      `;
      if (!okRows[0]?.ok) throw new TagNotFoundException();

      const sameRows = await this.prisma.$queryRaw<{ ok: boolean }[]>`
        select not exists (
          select 1
          from tg_tag tg
          where tg.id = any(${dto.tagIds}::uuid[])
            and not exists (
              select 1 from tg_task ta
              where ta.id = ${taskId}::uuid
                and ta.workspace_id = tg.workspace_id
            )
        ) as ok
      `;
      if (!sameRows[0]?.ok) throw new TaskTagWorkspaceMismatchException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        delete from tg_task_tag
        where task_id = ${taskId}::uuid
      `;

      if (dto.tagIds.length > 0) {
        await tx.$queryRaw`
          insert into tg_task_tag (task_id, tag_id)
          select ${taskId}::uuid, x::uuid
          from unnest(${dto.tagIds}::uuid[]) as x
          on conflict (task_id, tag_id) do nothing
        `;
      }
    });

    return this.listTagsByTask(taskId);
  }
}
