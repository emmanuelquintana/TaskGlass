import { Module } from '@nestjs/common';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [WorkspaceModule, PrismaModule]
})
export class AppModule { }
