import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { WorkspaceNotFoundException } from 'src/modules/workspace/errors/workspace-not-found.exception';
import { UpdateColumnSortOrderDto } from '../dto/update-column-sort-order.dto';
import { UpdateColumnSortOrdersDto } from '../dto/update-column-sort-orders.dto';
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
}
