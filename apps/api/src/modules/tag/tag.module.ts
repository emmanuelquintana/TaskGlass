import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TagService } from './tag.service';
import { WorkspaceTagsController } from './workspace-tags.controller';
import { TagsController } from './tags.controller';
import { TaskTagsController } from './task-tags.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceTagsController, TagsController, TaskTagsController],
  providers: [TagService],
  exports: [TagService]
})
export class TagModule {}
