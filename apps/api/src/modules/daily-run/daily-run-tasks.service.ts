import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { GenerateDailyRunTasksResultModel } from './dto/generate-daily-run-tasks-result.model';

type CreatedTaskRow = {
  id: string;
  title: string;
  status: string;
  priority: number;
  dueDate: string;
  templateId: string | null;
};

/**
 * DailyRunTasksService generates task instances for a given workspace+date
 * from daily recurrence templates and synchronizes template tags into task tags.
 */
@Injectable()
export class DailyRunTasksService {
  constructor(private readonly prisma: PrismaService) { }

  private async assertWorkspaceExists(workspaceId: string): Promise<void> {
    const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_workspace
        where id = ${workspaceId}::uuid
      ) as "exists"
    `;
    if (!ws[0]?.exists) throw new WorkspaceNotFoundException();
  }

  async generate(workspaceId: string, runDate: string): Promise<GenerateDailyRunTasksResultModel> {
    await this.assertWorkspaceExists(workspaceId);

    return this.prisma.$transaction(async (tx) => {
      // Ensure daily run exists
      await tx.$queryRaw`
        insert into tg_daily_run (workspace_id, run_date)
        values (${workspaceId}::uuid, ${runDate}::date)
        on conflict (workspace_id, run_date) do nothing
      `;

      // Count how many tasks already exist for (workspaceId, runDate) from templates (template_id not null)
      const before = await tx.$queryRaw<{ count: number }[]>`
        select count(*)::int as count
        from tg_task
        where workspace_id = ${workspaceId}::uuid
          and due_date = ${runDate}::date
          and template_id is not null
      `;
      const beforeCount = before[0]?.count ?? 0;

      // Insert tasks from active daily templates that are not created yet for that date.
      const created = await tx.$queryRaw<CreatedTaskRow[]>`
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
          rt.workspace_id,
          rt.title,
          rt.description,
          rt.status_default,
          rt.priority,
          ${runDate}::date,
          0,
          rt.id
        from tg_recurrence_template rt
        where rt.workspace_id = ${workspaceId}::uuid
          and rt.is_active = true
          and rt.cadence = 'daily'
          and not exists (
            select 1
            from tg_task t
            where t.workspace_id = rt.workspace_id
              and t.due_date = ${runDate}::date
              and t.template_id = rt.id
          )
        returning
          id::text as id,
          title,
          status::text as status,
          priority::int as priority,
          due_date::text as "dueDate",
          template_id::text as "templateId"
      `;

      // Sync tags: template tags -> task tags for ALL template-based tasks on that day.
      // This covers:
      // - tasks created in this call
      // - tasks already existing from previous runs (backfill tags if you added this later)
      await tx.$queryRaw`
        insert into tg_task_tag (task_id, tag_id)
        select
          t.id as task_id,
          rtt.tag_id as tag_id
        from tg_task t
        join tg_recurrence_template_tag rtt
          on rtt.template_id = t.template_id
        where t.workspace_id = ${workspaceId}::uuid
          and t.due_date = ${runDate}::date
          and t.template_id is not null
        on conflict (task_id, tag_id) do nothing
      `;

      const createdCount = created.length;

      return {
        workspaceId,
        runDate,
        created: createdCount,
        skipped: beforeCount,
        tasksCreated: created.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          templateId: t.templateId
        }))
      };
    });
  }
}
