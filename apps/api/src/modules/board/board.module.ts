import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { RecurrenceModule } from '../recurrence/recurrence.module';

/**
 * BoardModule exposes aggregated endpoints to render a Kanban board efficiently.
 */
@Module({
    imports: [PrismaModule, RecurrenceModule],
    controllers: [BoardController],
    providers: [BoardService]
})
export class BoardModule { }
