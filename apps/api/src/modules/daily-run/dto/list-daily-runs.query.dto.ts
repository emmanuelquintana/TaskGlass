import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ListDailyRunsQueryDto {
  /**
   * ISO date (YYYY-MM-DD).
   */
  @ApiPropertyOptional({ example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  /**
   * ISO date (YYYY-MM-DD).
   */
  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
