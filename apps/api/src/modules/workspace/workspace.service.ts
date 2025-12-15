import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WorkspaceNotFoundException } from './errors/workspace-not-found.exception';
import { WorkspaceCodeAlreadyExistsException } from './errors/workspace-code-already-exists.exception';
import { WorkspaceModel } from './models/workspace.model';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

type WorkspaceRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) { }

  async list(): Promise<WorkspaceModel[]> {
    const rows = await this.prisma.$queryRaw<WorkspaceRow[]>`
      select
        id::text as id,
        code,
        name,
        description
      from tg_workspace
      where deleted_at is null
      order by created_at asc
    `;

    return rows.map((r: WorkspaceRow) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description ?? undefined
    }));
  }

  async getById(id: string): Promise<WorkspaceModel> {
    const rows = await this.prisma.$queryRaw<WorkspaceRow[]>`
      select
        id::text as id,
        code,
        name,
        description
      from tg_workspace
      where id = ${id}::uuid
        and deleted_at is null
      limit 1
    `;

    const found = rows[0];
    if (!found) throw new WorkspaceNotFoundException();

    return {
      id: found.id,
      code: found.code,
      name: found.name,
      description: found.description ?? undefined
    };
  }

  async create(dto: CreateWorkspaceDto): Promise<WorkspaceModel> {
    const existing = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1
        from tg_workspace
        where code = ${dto.code}
          and deleted_at is null
      ) as "exists"
    `;

    if (existing[0]?.exists) throw new WorkspaceCodeAlreadyExistsException();

    const rows = await this.prisma.$queryRaw<WorkspaceRow[]>`
      insert into tg_workspace (code, name, description)
      values (${dto.code}, ${dto.name}, ${dto.description ?? null})
      returning
        id::text as id,
        code,
        name,
        description
    `;

    const created = rows[0];
    return {
      id: created.id,
      code: created.code,
      name: created.name,
      description: created.description ?? undefined
    };
  }

  async update(id: string, dto: UpdateWorkspaceDto): Promise<WorkspaceModel> {
    const rows = await this.prisma.$queryRaw<WorkspaceRow[]>`
      update tg_workspace
      set
        name = coalesce(${dto.name ?? null}, name),
        description = coalesce(${dto.description ?? null}, description)
      where id = ${id}::uuid
        and deleted_at is null
      returning
        id::text as id,
        code,
        name,
        description
    `;

    const updated = rows[0];
    if (!updated) throw new WorkspaceNotFoundException();

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      description: updated.description ?? undefined
    };
  }

  async remove(id: string): Promise<{ id: string }> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      update tg_workspace
      set deleted_at = now()
      where id = ${id}::uuid
        and deleted_at is null
      returning id::text as id
    `;

    const removed = rows[0];
    if (!removed) throw new WorkspaceNotFoundException();

    return { id: removed.id };
  }
}
