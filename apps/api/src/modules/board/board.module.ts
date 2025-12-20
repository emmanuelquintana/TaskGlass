import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

/**
 * BoardModule exposes aggregated endpoints to render a Kanban board efficiently.
 */
@Module({
    imports: [PrismaModule],
    controllers: [BoardController],
    providers: [BoardService]
})
export class BoardModule { }
