import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TaskService } from './task.service';
import { TasksController } from './tasks.controller';
import { WorkspaceTasksController } from './workspace-tasks.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, WorkspaceTasksController],
  providers: [TaskService],
  exports: [TaskService]
})
export class TaskModule {}
