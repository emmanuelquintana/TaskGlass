import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from '../workspace/errors/workspace-not-found.exception';
import { CreateSavedViewDto } from './dto/create-saved-view.dto';
import { UpdateSavedViewDto } from './dto/update-saved-view.dto';
import { SavedViewModel } from './models/saved-view.model';
import { SavedViewNotFoundException } from './errors/saved-view-not-found.exception';
import { SavedViewAlreadyExistsException } from './errors/saved-view-already-exists.exception';

type SavedViewRow = {
  id: string;
  workspaceId: string;
  name: string;
  filters: unknown;
  sort: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * SavedViewService provides CRUD for tg_saved_view.
 */
@Injectable()
export class SavedViewService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(r: SavedViewRow): SavedViewModel {
    return {
      id: r.id,
      workspaceId: r.workspaceId,
      name: r.name,
      filters: (r.filters ?? {}) as Record<string, unknown>,
      sort: (r.sort ?? {}) as Record<string, unknown>,
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined
    };
  }

  private asJsonb(v: unknown | undefined): string | null {
    if (v === undefined) return null;
    return JSON.stringify(v);
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

  private async getRowById(id: string): Promise<SavedViewRow | null> {
    const rows = await this.prisma.$queryRaw<SavedViewRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        name,
        filters,
        sort,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_saved_view
      where id = ${id}::uuid
      limit 1
    `;
    return rows[0] ?? null;
  }

  async listByWorkspace(workspaceId: string): Promise<SavedViewModel[]> {
    await this.assertWorkspaceExists(workspaceId);

    const rows = await this.prisma.$queryRaw<SavedViewRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        name,
        filters,
        sort,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from tg_saved_view
      where workspace_id = ${workspaceId}::uuid
      order by name asc
    `;
    return rows.map((r) => this.mapRow(r));
  }

  async create(workspaceId: string, dto: CreateSavedViewDto): Promise<SavedViewModel> {
    await this.assertWorkspaceExists(workspaceId);

    const exists = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_saved_view
        where workspace_id = ${workspaceId}::uuid
          and name = ${dto.name}
      ) as "exists"
    `;
    if (exists[0]?.exists) throw new SavedViewAlreadyExistsException();

    const filtersJson = this.asJsonb(dto.filters) ?? '{}';
    const sortJson = this.asJsonb(dto.sort) ?? '{}';

    const rows = await this.prisma.$queryRaw<SavedViewRow[]>`
      insert into tg_saved_view (workspace_id, name, filters, sort)
      values (
        ${workspaceId}::uuid,
        ${dto.name},
        ${filtersJson}::jsonb,
        ${sortJson}::jsonb
      )
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        name,
        filters,
        sort,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.mapRow(rows[0]);
  }

  async getById(id: string): Promise<SavedViewModel> {
    const row = await this.getRowById(id);
    if (!row) throw new SavedViewNotFoundException();
    return this.mapRow(row);
  }

  async update(id: string, dto: UpdateSavedViewDto): Promise<SavedViewModel> {
    const current = await this.getRowById(id);
    if (!current) throw new SavedViewNotFoundException();

    const nextName = dto.name ?? current.name;

    const exists = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_saved_view
        where workspace_id = ${current.workspaceId}::uuid
          and name = ${nextName}
          and id <> ${id}::uuid
      ) as "exists"
    `;
    if (exists[0]?.exists) throw new SavedViewAlreadyExistsException();

    const name = dto.name ?? null;
    const filtersJson = this.asJsonb(dto.filters);
    const sortJson = this.asJsonb(dto.sort);

    const rows = await this.prisma.$queryRaw<SavedViewRow[]>`
      update tg_saved_view
      set
        name = coalesce(${name}, name),
        filters = coalesce(${filtersJson}::jsonb, filters),
        sort = coalesce(${sortJson}::jsonb, sort),
        updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        name,
        filters,
        sort,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.mapRow(rows[0]);
  }

  async remove(id: string): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      delete from tg_saved_view
      where id = ${id}::uuid
      returning id::text as id
    `;
    const removed = rows[0];
    if (!removed) throw new SavedViewNotFoundException();
    return { id: removed.id };
  }
}
