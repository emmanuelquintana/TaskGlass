import { Module } from '@nestjs/common';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ColumnModule } from './modules/column/column.module';

@Module({
  imports: [WorkspaceModule, PrismaModule, ColumnModule]
})
export class AppModule { }
