import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
    private readonly pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL is missing or empty. Check apps/api/.env');
        }

        const pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });

        super({ adapter: new PrismaPg(pool) });
        this.pool = pool;
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onApplicationShutdown(): Promise<void> {
        await this.$disconnect();
        await this.pool.end();
    }
}
