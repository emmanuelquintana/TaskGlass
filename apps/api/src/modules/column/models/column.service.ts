import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { WorkspaceNotFoundException } from 'src/modules/workspace/errors/workspace-not-found.exception';
import { UpdateColumnSortOrderDto } from '../dto/update-column-sort-order.dto';
import { UpdateColumnSortOrdersDto } from '../dto/update-column-sort-orders.dto';
import { CreateColumnDto } from '../dto/create-column.dto';
import { UpdateColumnTitleDto } from '../dto/update-column-title.dto';
import { ColumnNotFoundException } from '../errors/column-not-found.exception';
import { ColumnModel } from './column.model';


type ColumnRow = {
    id: string;
    workspaceId: string;
    key: string;
    title: string;
    sortOrder: number;
};

/**
 * ColumnService handles workspace columns customization (title and order).
 * Column keys are tied to tg_task_status enum.
 */
@Injectable()
export class ColumnService {
    constructor(private readonly prisma: PrismaService) { }

    private mapRow(r: ColumnRow): ColumnModel {
        return {
            id: r.id,
            workspaceId: r.workspaceId,
            key: r.key,
            title: r.title,
            sortOrder: r.sortOrder
        };
    }

    async listByWorkspace(workspaceId: string): Promise<ColumnModel[]> {
        const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
      select exists(
        select 1 from tg_workspace
        where id = ${workspaceId}::uuid
          and deleted_at is null
      ) as "exists"
    `;
        if (!ws[0]?.exists) throw new WorkspaceNotFoundException();

        const rows = await this.prisma.$queryRaw<ColumnRow[]>`
      select
        id::text as id,
        workspace_id::text as "workspaceId",
        "key"::text as "key",
        title,
        sort_order as "sortOrder"
      from tg_column
      where workspace_id = ${workspaceId}::uuid
      order by sort_order asc
    `;

        return rows.map((r) => this.mapRow(r));
    }

    async create(workspaceId: string, dto: CreateColumnDto): Promise<ColumnModel> {
        // Ensure workspace exists
        const ws = await this.prisma.$queryRaw<{ exists: boolean }[]>`
            select exists(select 1 from tg_workspace where id = ${workspaceId}::uuid and deleted_at is null) as "exists"
        `;
        if (!ws[0]?.exists) throw new WorkspaceNotFoundException();

        // Validate key format for safety and consistency
        if (!/^[a-z0-9_]+$/.test(dto.key)) {
            throw new BadRequestException('Key must only contain lowercase alphanumeric characters and underscores');
        }

        // Add key to enum if not exists
        // This is necessary because the column key column is typed as tg_task_status enum
        try {
            await this.prisma.$executeRawUnsafe(`ALTER TYPE tg_task_status ADD VALUE IF NOT EXISTS '${dto.key}'`);
        } catch (error: any) {
            // Ignore if it's just about the transaction block, though ideally we shouldn't be in one.
            // Code 25001 means active_sql_transaction.
            console.error('Failed to alter type:', error);
        }

        // Check if key already exists in workspace
        const existingKey = await this.prisma.$queryRaw<{ exists: boolean }[]>`
            select exists(select 1 from tg_column where workspace_id = ${workspaceId}::uuid and key = ${dto.key}::tg_task_status) as "exists"
        `;

        if (existingKey[0]?.exists) {
            throw new BadRequestException(`Column with key '${dto.key}' already exists in this workspace`);
        }


        // Determine sort order if not provided: max + 1
        let sortOrder = dto.sortOrder;
        if (sortOrder === undefined) {
            const max = await this.prisma.$queryRaw<{ maxOrder: number }[]>`
                select coalesce(max(sort_order), 0) as "maxOrder" from tg_column where workspace_id = ${workspaceId}::uuid
             `;
            sortOrder = (max[0]?.maxOrder ?? 0) + 1;
        }

        const rows = await this.prisma.$queryRaw<ColumnRow[]>`
            insert into tg_column (workspace_id, key, title, sort_order)
            values (${workspaceId}::uuid, ${dto.key}::tg_task_status, ${dto.title}, ${sortOrder})
            returning
                id::text as id,
                workspace_id::text as "workspaceId",
                "key"::text as "key",
                title,
                sort_order as "sortOrder"
        `;

        const created = rows[0];
        return this.mapRow(created);
    }

    async updateTitle(id: string, dto: UpdateColumnTitleDto): Promise<ColumnModel> {
        const rows = await this.prisma.$queryRaw<ColumnRow[]>`
      update tg_column
      set title = ${dto.title},
          updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        "key"::text as "key",
        title,
        sort_order as "sortOrder"
    `;

        const updated = rows[0];
        if (!updated) throw new ColumnNotFoundException();

        return this.mapRow(updated);
    }

    async updateSortOrder(id: string, dto: UpdateColumnSortOrderDto): Promise<ColumnModel> {
        const rows = await this.prisma.$queryRaw<ColumnRow[]>`
      update tg_column
      set sort_order = ${dto.sortOrder},
          updated_at = now()
      where id = ${id}::uuid
      returning
        id::text as id,
        workspace_id::text as "workspaceId",
        "key"::text as "key",
        title,
        sort_order as "sortOrder"
    `;

        const updated = rows[0];
        if (!updated) throw new ColumnNotFoundException();

        return this.mapRow(updated);
    }

    async updateSortOrdersBatch(dto: UpdateColumnSortOrdersDto): Promise<ColumnModel[]> {
        const items = dto.items ?? [];
        if (items.length === 0) throw new BadRequestException('items must not be empty');

        const ids = items.map((i) => i.id);
        const unique = new Set(ids);
        if (unique.size !== ids.length) {
            throw new BadRequestException('items contains duplicated ids');
        }

        const updatedRows: ColumnModel[] = [];

        await this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                const rows = await tx.$queryRaw<ColumnRow[]>`
          update tg_column
          set sort_order = ${item.sortOrder},
              updated_at = now()
          where id = ${item.id}::uuid
          returning
            id::text as id,
            workspace_id::text as "workspaceId",
            "key"::text as "key",
            title,
            sort_order as "sortOrder"
        `;

                const updated = rows[0];
                if (!updated) throw new ColumnNotFoundException();

                updatedRows.push(this.mapRow(updated));
            }
        });

        return updatedRows.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    async delete(id: string): Promise<void> {
        // 1. Get column info
        const rows = await this.prisma.$queryRaw<ColumnRow[]>`
            select id::text as id, workspace_id::text as "workspaceId", "key"::text as "key"
            from tg_column
            where id = ${id}::uuid
        `;
        const col = rows[0];
        if (!col) throw new ColumnNotFoundException();

        // 2. Delete tasks with this status in this workspace
        // This is safe because tg_column has a workspace_id and key is unique per workspace
        await this.prisma.$executeRaw`
            delete from tg_task
            where workspace_id = ${col.workspaceId}::uuid
              and status = ${col.key}::tg_task_status
        `;

        // 3. Delete column
        await this.prisma.$executeRaw`
            delete from tg_column
            where id = ${id}::uuid
        `;
    }
}
