import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { DailyRunService } from './daily-run.service';
import { DailyRunsController } from './daily-runs.controller';
import { DailyRunTasksController } from './daily-run-tasks.controller';
import { DailyRunTasksService } from './daily-run-tasks.service';

@Module({
  imports: [PrismaModule],
  controllers: [DailyRunsController, DailyRunTasksController],
  providers: [DailyRunService, DailyRunTasksService],
  exports: [DailyRunService, DailyRunTasksService]
})
export class DailyRunModule { }
