import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SavedViewService } from './saved-view.service';
import { WorkspaceSavedViewsController } from './workspace-saved-views.controller';
import { SavedViewsController } from './saved-views.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceSavedViewsController, SavedViewsController],
  providers: [SavedViewService],
  exports: [SavedViewService]
})
export class SavedViewModule {}
