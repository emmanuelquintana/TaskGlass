import { ApiProperty } from '@nestjs/swagger';

export class DailyRunModel {
  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  /**
   * ISO date (YYYY-MM-DD)
   */
  @ApiProperty({ example: '2025-12-20' })
  runDate!: string;

  @ApiProperty({ example: '2025-12-20T12:00:00.000Z', required: false })
  createdAt?: string;
}
