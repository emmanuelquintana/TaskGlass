import { ApiProperty } from '@nestjs/swagger';

export class GenerateDailyRunTasksResultModel {
  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  /**
   * ISO date (YYYY-MM-DD)
   */
  @ApiProperty({ example: '2025-12-20' })
  runDate!: string;

  @ApiProperty({ example: 7 })
  created!: number;

  @ApiProperty({ example: 0 })
  skipped!: number;

  @ApiProperty({
    example: [
      {
        id: '2b6f8d42-3e1f-4a7d-9a7a-0e6ed2f86d61',
        title: 'Review invoices',
        status: 'todo',
        priority: 3,
        dueDate: '2025-12-20',
        templateId: 'd2f2c0e4-1fd7-4d4f-9be5-6c09d0c7f2f1'
      }
    ]
  })
  tasksCreated!: Array<{
    id: string;
    title: string;
    status: string;
    priority: number;
    dueDate: string;
    templateId: string | null;
  }>;
}
