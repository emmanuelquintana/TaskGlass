import { Module } from '@nestjs/common';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ColumnModule } from './modules/column/column.module';
import { TaskModule } from './modules/task/task.module';
import { RecurrenceModule } from './modules/recurrence/recurrence.module';

@Module({
  imports: [WorkspaceModule, PrismaModule, ColumnModule, TaskModule, RecurrenceModule]
})
export class AppModule { }
