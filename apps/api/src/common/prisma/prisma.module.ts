import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule provides PrismaService as a global provider.
 */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService]
})
export class PrismaModule { }
