import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { RecurrenceTemplateNotFoundException } from './errors/recurrence-template-not-found.exception';
import { CreateRecurrenceTemplateDto } from './dto/create-template.dto';
import { UpdateRecurrenceTemplateDto } from './dto/update-template.dto';
import { SetTemplateActiveDto } from './dto/set-template-active.dto';
import { RecurrenceTemplateModel } from './models/recurrence-template.model';
import { DailyRunResultModel } from './models/daily-run-result.model';
import { TagModel } from '../tag/models/tag.model';

type TemplateRow = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  statusDefault: string;
  priority: number;
  cadence: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  tags: TagModel[];
};

type InsertCountRow = { count: number };

/**
 * RecurrenceService provides CRUD for recurrence templates and the "daily run" generator.
 * Daily runs generate tasks for a specific date from active templates (cadence=daily).
 */
@Injectable()
export class RecurrenceService {
  constructor(private readonly prisma: PrismaService) { }

  private mapTemplate(r: TemplateRow): RecurrenceTemplateModel {
    return {
      id: r.id,
      workspaceId: r.workspaceId,
      title: r.title,
      description: r.description ?? undefined,
      statusDefault: r.statusDefault,
      priority: r.priority,
      cadence: r.cadence,
      isActive: r.isActive,
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
      ) as "exists"
    `;
    if (!ws[0]?.exists) throw new WorkspaceNotFoundException();
  }

  async listTemplates(workspaceId: string): Promise<RecurrenceTemplateModel[]> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      select
        t.id::text as id,
        t.workspace_id::text as "workspaceId",
        t.title,
        t.description,
        t.status_default::text as "statusDefault",
        t.priority::int as priority,
        t.cadence,
        t.is_active as "isActive",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        coalesce(
            (
                select json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
                from tg_recurrence_template_tag tt
                join tg_tag tg on tg.id = tt.tag_id
                where tt.template_id = t.id
            ),
            '[]'::json
        ) as tags
      from tg_recurrence_template t
      where t.workspace_id = ${workspaceId}::uuid
      order by t.is_active desc, t.updated_at desc
    `;

    return rows.map((r) => this.mapTemplate(r));
  }

  async createTemplate(workspaceId: string, dto: CreateRecurrenceTemplateDto): Promise<RecurrenceTemplateModel> {
    await this.assertWorkspaceExists(workspaceId);

    const statusDefault = dto.statusDefault ?? 'todo';
    const priority = dto.priority ?? 3;
    const cadence = dto.cadence ?? 'daily';
    const isActive = dto.isActive ?? true;

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<TemplateRow[]>`
        insert into tg_recurrence_template (
          workspace_id, title, description, status_default, priority, cadence, is_active
        )
        values (
          ${workspaceId}::uuid,
          ${dto.title},
          ${dto.description ?? null},
          ${statusDefault}::tg_task_status,
          ${priority}::smallint,
          ${cadence},
          ${isActive}
        )
        returning
          id::text as id,
          workspace_id::text as "workspaceId",
          title,
          description,
          status_default::text as "statusDefault",
          priority::int as priority,
          cadence,
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt",
          '[]'::json as tags
      `;

      const template = rows[0];

      const insertedTags: TagModel[] = [];
      if (dto.tagIds?.length) {
        const uniqueTags = [...new Set(dto.tagIds)];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const rawTagValue of uniqueTags) {
          let tagIdToLink = rawTagValue;
          let tagName = rawTagValue;
          let tagColor = '#6b7280';

          if (rawTagValue.includes(':')) {
            const parts = rawTagValue.split(':');
            if (parts.length === 2) {
              tagName = parts[0];
              tagColor = parts[1];
            }
          }

          if (!uuidRegex.test(tagName)) {
            const existing = await tx.$queryRaw<TagModel[]>`
                select id, name, color from tg_tag 
                where name = ${tagName} 
                  and workspace_id = ${workspaceId}::uuid
                limit 1
            `;

            if (existing[0]) {
              tagIdToLink = existing[0].id;
              insertedTags.push(existing[0]);
            } else {
              const newTagRows = await tx.$queryRaw<TagModel[]>`
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
                const retry = await tx.$queryRaw<TagModel[]>`
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
            tagIdToLink = tagName;
          }

          if (uuidRegex.test(tagIdToLink)) {
            await tx.$executeRaw`
                insert into tg_recurrence_template_tag (template_id, tag_id)
                values (${template.id}::uuid, ${tagIdToLink}::uuid)
                on conflict do nothing
             `;
          }
        }
      }
      template.tags = insertedTags;

      return this.mapTemplate(template);
    });
  }

  async getTemplate(id: string): Promise<RecurrenceTemplateModel> {
    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      select
        t.id::text as id,
        t.workspace_id::text as "workspaceId",
        t.title,
        t.description,
        t.status_default::text as "statusDefault",
        t.priority::int as priority,
        t.cadence,
        t.is_active as "isActive",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        coalesce(
            (
                select json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
                from tg_recurrence_template_tag tt
                join tg_tag tg on tg.id = tt.tag_id
                where tt.template_id = t.id
            ),
            '[]'::json
        ) as tags
      from tg_recurrence_template t
      where t.id = ${id}::uuid
      limit 1
    `;

    const found = rows[0];
    if (!found) throw new RecurrenceTemplateNotFoundException();
    return this.mapTemplate(found);
  }

  async updateTemplate(id: string, dto: UpdateRecurrenceTemplateDto): Promise<RecurrenceTemplateModel> {
    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      update tg_recurrence_template
      set
        title = coalesce(${dto.title ?? null}, title),
        description = coalesce(${dto.description ?? null}, description),
        status_default = coalesce(${dto.statusDefault ?? null}::tg_task_status, status_default),
        priority = coalesce(${dto.priority ?? null}::smallint, priority),
        cadence = coalesce(${dto.cadence ?? null}, cadence),
        is_active = coalesce(${dto.isActive ?? null}, is_active),
        updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        title,
        description,
        status_default::text as "statusDefault",
        priority::int as priority,
        cadence,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const updated = rows[0];
    if (!updated) throw new RecurrenceTemplateNotFoundException();
    return this.mapTemplate(updated);
  }

  async setTemplateActive(id: string, dto: SetTemplateActiveDto): Promise<RecurrenceTemplateModel> {
    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      update tg_recurrence_template
      set is_active = ${dto.isActive},
          updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        title,
        description,
        status_default::text as "statusDefault",
        priority::int as priority,
        cadence,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const updated = rows[0];
    if (!updated) throw new RecurrenceTemplateNotFoundException();
    return this.mapTemplate(updated);
  }

  async runDaily(workspaceId: string, runDate: string): Promise<DailyRunResultModel> {
    await this.assertWorkspaceExists(workspaceId);

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        insert into tg_daily_run (workspace_id, run_date)
        values (${workspaceId}::uuid, ${runDate}::date)
        on conflict (workspace_id, run_date) do nothing
      `;

      const rows = await tx.$queryRaw<InsertCountRow[]>`
        with ins as (
          insert into tg_task (
            workspace_id,
            title,
            description,
            status,
            priority,
            due_date,
            sort_order,
            template_id
          )
          select
            t.workspace_id,
            t.title,
            t.description,
            t.status_default,
            t.priority,
            ${runDate}::date,
            0,
            t.id
          from tg_recurrence_template t
          where t.workspace_id = ${workspaceId}::uuid
            and t.is_active = true
            and t.cadence = 'daily'
            and not exists (
              select 1
              from tg_task x
              where x.workspace_id = t.workspace_id
                and x.template_id = t.id
                and x.due_date = ${runDate}::date
            )
          returning 1
        )
        select count(*)::int as count from ins
      `;
      return rows[0]?.count ?? 0;
    });

    return { runDate, createdTasks: created };
  }
}
