import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { DailyRunNotFoundException } from './errors/daily-run-not-found.exception';
import { DailyRunModel } from './models/daily-run.model';

type DailyRunRow = {
  workspaceId: string;
  runDate: string; // YYYY-MM-DD
  createdAt: Date | null;
};

/**
 * DailyRunService manages `tg_daily_run` records.
 */
@Injectable()
export class DailyRunService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(r: DailyRunRow): DailyRunModel {
    return {
      workspaceId: r.workspaceId,
      runDate: r.runDate,
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined
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

  async list(workspaceId: string, from?: string, to?: string): Promise<DailyRunModel[]> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<DailyRunRow[]>`
      select
        workspace_id::text as "workspaceId",
        run_date::text as "runDate",
        created_at as "createdAt"
      from tg_daily_run
      where workspace_id = ${workspaceId}::uuid
        and run_date >= coalesce(${from}::date, run_date)
        and run_date <= coalesce(${to}::date, run_date)
      order by run_date desc
    `;

    return rows.map((r) => this.mapRow(r));
  }

  async get(workspaceId: string, runDate: string): Promise<DailyRunModel> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<DailyRunRow[]>`
      select
        workspace_id::text as "workspaceId",
        run_date::text as "runDate",
        created_at as "createdAt"
      from tg_daily_run
      where workspace_id = ${workspaceId}::uuid
        and run_date = ${runDate}::date
      limit 1
    `;

    const row = rows[0];
    if (!row) throw new DailyRunNotFoundException();
    return this.mapRow(row);
  }

  async upsert(workspaceId: string, runDate: string): Promise<DailyRunModel> {
    await this.assertWorkspaceExists(workspaceId);

    await this.prisma.$queryRaw`
      insert into tg_daily_run (workspace_id, run_date)
      values (${workspaceId}::uuid, ${runDate}::date)
      on conflict (workspace_id, run_date) do nothing
    `;

    const rows = await this.prisma.$queryRaw<DailyRunRow[]>`
      select
        workspace_id::text as "workspaceId",
        run_date::text as "runDate",
        created_at as "createdAt"
      from tg_daily_run
      where workspace_id = ${workspaceId}::uuid
        and run_date = ${runDate}::date
      limit 1
    `;

    const row = rows[0];
    if (!row) throw new DailyRunNotFoundException();
    return this.mapRow(row);
  }

  async remove(workspaceId: string, runDate: string): Promise<{ workspaceId: string; runDate: string }> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<{ workspaceId: string; runDate: string }[]>`
      delete from tg_daily_run
      where workspace_id = ${workspaceId}::uuid
        and run_date = ${runDate}::date
      returning
        workspace_id::text as "workspaceId",
        run_date::text as "runDate"
    `;

    const removed = rows[0];
    if (!removed) throw new DailyRunNotFoundException();
    return removed;
  }
}
