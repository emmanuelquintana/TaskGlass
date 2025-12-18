import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class RunDailyDto {
  @ApiPropertyOptional({ example: '2025-12-17', description: 'YYYY-MM-DD. If omitted, server uses today (server time).' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  runDate?: string;
}
