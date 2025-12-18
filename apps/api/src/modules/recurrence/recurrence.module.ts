import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RecurrenceService } from './recurrence.service';
import { WorkspaceRecurrenceTemplatesController } from './workspace-recurrence-templates.controller';
import { RecurrenceTemplatesController } from './recurrence-templates.controller';
import { WorkspaceDailyRunsController } from './workspace-daily-runs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceRecurrenceTemplatesController, RecurrenceTemplatesController, WorkspaceDailyRunsController],
  providers: [RecurrenceService],
  exports: [RecurrenceService]
})
export class RecurrenceModule {}
