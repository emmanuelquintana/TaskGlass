import { Module } from '@nestjs/common';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ColumnModule } from './modules/column/column.module';
import { TaskModule } from './modules/task/task.module';
import { RecurrenceModule } from './modules/recurrence/recurrence.module';
import { TagModule } from './modules/tag/tag.module';
import { RecurrenceTemplateTagModule } from './modules/recurrence-template-tag/recurrence-template-tag.module';

@Module({
  imports: [WorkspaceModule, PrismaModule, ColumnModule, TaskModule, RecurrenceModule, TagModule, RecurrenceTemplateTagModule]
})
export class AppModule { }
