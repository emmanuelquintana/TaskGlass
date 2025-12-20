import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RecurrenceTemplateNotFoundException } from '../recurrence/errors/recurrence-template-not-found.exception';
import { TagNotFoundException } from '../tag/errors/tag-not-found.exception';
import { TagModel } from '../tag/models/tag.model';
import { ReplaceTemplateTagsDto } from './dto/replace-template-tags.dto';
import { RecurrenceTemplateTagWorkspaceMismatchException } from './errors/recurrence-template-tag-workspace-mismatch.exception';

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
 * RecurrenceTemplateTagService manages the join table `tg_recurrence_template_tag`.
 */
@Injectable()
export class RecurrenceTemplateTagService {
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

  private async getTemplateWorkspaceId(templateId: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ workspaceId: string }[]>`
      select workspace_id::text as "workspaceId"
      from tg_recurrence_template
      where id = ${templateId}::uuid
      limit 1
    `;
    return rows[0]?.workspaceId ?? null;
  }

  private async getTagWorkspaceId(tagId: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ workspaceId: string }[]>`
      select workspace_id::text as "workspaceId"
      from tg_tag
      where id = ${tagId}::uuid
      limit 1
    `;
    return rows[0]?.workspaceId ?? null;
  }

  private async assertSameWorkspace(templateId: string, tagId: string): Promise<void> {
    const templateWorkspaceId = await this.getTemplateWorkspaceId(templateId);
    if (!templateWorkspaceId) throw new RecurrenceTemplateNotFoundException();

    const tagWorkspaceId = await this.getTagWorkspaceId(tagId);
    if (!tagWorkspaceId) throw new TagNotFoundException();

    if (templateWorkspaceId !== tagWorkspaceId) {
      throw new RecurrenceTemplateTagWorkspaceMismatchException();
    }
  }

  async listTagsByTemplate(templateId: string): Promise<TagModel[]> {
    const templateWorkspaceId = await this.getTemplateWorkspaceId(templateId);
    if (!templateWorkspaceId) throw new RecurrenceTemplateNotFoundException();

    const rows = await this.prisma.$queryRaw<TagRow[]>`
      select
        t.id::text as id,
        t.workspace_id::text as "workspaceId",
        t.group_key as "groupKey",
        t.name,
        t.color,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt"
      from tg_recurrence_template_tag rtt
      join tg_tag t on t.id = rtt.tag_id
      where rtt.template_id = ${templateId}::uuid
      order by t.group_key asc, t.name asc
    `;
    return rows.map((r) => this.mapTag(r));
  }

  async attach(templateId: string, tagId: string): Promise<{ templateId: string; tagId: string }> {
    await this.assertSameWorkspace(templateId, tagId);

    await this.prisma.$queryRaw`
      insert into tg_recurrence_template_tag (template_id, tag_id)
      values (${templateId}::uuid, ${tagId}::uuid)
      on conflict (template_id, tag_id) do nothing
    `;

    return { templateId, tagId };
  }

  async detach(templateId: string, tagId: string): Promise<{ templateId: string; tagId: string }> {
    const templateWorkspaceId = await this.getTemplateWorkspaceId(templateId);
    if (!templateWorkspaceId) throw new RecurrenceTemplateNotFoundException();

    const tagWorkspaceId = await this.getTagWorkspaceId(tagId);
    if (!tagWorkspaceId) throw new TagNotFoundException();

    await this.prisma.$queryRaw`
      delete from tg_recurrence_template_tag
      where template_id = ${templateId}::uuid
        and tag_id = ${tagId}::uuid
    `;

    return { templateId, tagId };
  }

  async replace(templateId: string, dto: ReplaceTemplateTagsDto): Promise<TagModel[]> {
    const templateWorkspaceId = await this.getTemplateWorkspaceId(templateId);
    if (!templateWorkspaceId) throw new RecurrenceTemplateNotFoundException();

    if (dto.tagIds.length > 0) {
      const countRows = await this.prisma.$queryRaw<{ ok: boolean }[]>`
        select (
          select count(*)::int
          from tg_tag
          where id = any(${dto.tagIds}::uuid[])
        ) = ${dto.tagIds.length}::int as ok
      `;
      if (!countRows[0]?.ok) throw new TagNotFoundException();

      const sameRows = await this.prisma.$queryRaw<{ ok: boolean }[]>`
        select not exists (
          select 1
          from tg_tag tg
          where tg.id = any(${dto.tagIds}::uuid[])
            and tg.workspace_id::text <> ${templateWorkspaceId}
        ) as ok
      `;
      if (!sameRows[0]?.ok) throw new RecurrenceTemplateTagWorkspaceMismatchException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        delete from tg_recurrence_template_tag
        where template_id = ${templateId}::uuid
      `;

      if (dto.tagIds.length > 0) {
        await tx.$queryRaw`
          insert into tg_recurrence_template_tag (template_id, tag_id)
          select ${templateId}::uuid, x::uuid
          from unnest(${dto.tagIds}::uuid[]) as x
          on conflict (template_id, tag_id) do nothing
        `;
      }
    });

    return this.listTagsByTemplate(templateId);
  }
}
