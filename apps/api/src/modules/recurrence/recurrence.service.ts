import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { RecurrenceTemplateNotFoundException } from './errors/recurrence-template-not-found.exception';
import { CreateRecurrenceTemplateDto } from './dto/create-template.dto';
import { UpdateRecurrenceTemplateDto } from './dto/update-template.dto';
import { SetTemplateActiveDto } from './dto/set-template-active.dto';
import { RecurrenceTemplateModel } from './models/recurrence-template.model';
import { DailyRunResultModel } from './models/daily-run-result.model';

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
};

type InsertCountRow = { count: number };

/**
 * RecurrenceService provides CRUD for recurrence templates and the "daily run" generator.
 * Daily runs generate tasks for a specific date from active templates (cadence=daily).
 */
@Injectable()
export class RecurrenceService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listTemplates(workspaceId: string): Promise<RecurrenceTemplateModel[]> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      select
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
      from tg_recurrence_template
      where workspace_id = ${workspaceId}::uuid
      order by is_active desc, updated_at desc
    `;

    return rows.map((r) => this.mapTemplate(r));
  }

  async createTemplate(workspaceId: string, dto: CreateRecurrenceTemplateDto): Promise<RecurrenceTemplateModel> {
    await this.assertWorkspaceExists(workspaceId);

    const statusDefault = dto.statusDefault ?? 'todo';
    const priority = dto.priority ?? 3;
    const cadence = dto.cadence ?? 'daily';
    const isActive = dto.isActive ?? true;

    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
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
        updated_at as "updatedAt"
    `;

    return this.mapTemplate(rows[0]);
  }

  async getTemplate(id: string): Promise<RecurrenceTemplateModel> {
    const rows = await this.prisma.$queryRaw<TemplateRow[]>`
      select
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
      from tg_recurrence_template
      where id = ${id}::uuid
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
