import { ApiProperty } from '@nestjs/swagger';

export class DailyRunResultModel {
  @ApiProperty({ example: '2025-12-17' })
  runDate!: string;

  @ApiProperty({ example: 6 })
  createdTasks!: number;
}
