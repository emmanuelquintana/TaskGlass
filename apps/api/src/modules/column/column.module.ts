import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ColumnsController } from './models/columns.controller';
import { WorkspaceColumnsController } from './models/workspace-columns.controller';
import { ColumnService } from './models/column.service';


@Module({
    imports: [PrismaModule],
    controllers: [ColumnsController, WorkspaceColumnsController],
    providers: [ColumnService],
    exports: [ColumnService]
})
export class ColumnModule { }
