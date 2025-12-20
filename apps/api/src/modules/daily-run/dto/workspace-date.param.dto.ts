import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class WorkspaceDateParamDto {
  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @IsUUID('4')
  workspaceId!: string;

  /**
   * ISO date (YYYY-MM-DD).
   */
  @ApiProperty({ example: '2025-12-20' })
  @IsDateString()
  runDate!: string;
}
