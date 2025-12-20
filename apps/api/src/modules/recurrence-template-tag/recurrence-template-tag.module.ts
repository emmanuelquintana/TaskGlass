import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RecurrenceTemplateTagService } from './recurrence-template-tag.service';
import { RecurrenceTemplateTagsController } from './recurrence-template-tags.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecurrenceTemplateTagsController],
  providers: [RecurrenceTemplateTagService],
  exports: [RecurrenceTemplateTagService]
})
export class RecurrenceTemplateTagModule {}
