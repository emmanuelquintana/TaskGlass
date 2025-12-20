import { ApiProperty } from '@nestjs/swagger';

export class TaskModel {
  @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  id!: string;

  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
  status!: string;

  @ApiProperty({ example: 'Review bank sprint tickets' })
  title!: string;

  @ApiProperty({ example: 'Start with highest priority items', required: false })
  description?: string;

  @ApiProperty({ example: 3, description: '1 (highest) .. 5 (lowest)' })
  priority!: number;

  @ApiProperty({
    example: '2025-12-20',
    required: false,
    description: 'ISO date (YYYY-MM-DD)'
  })
  dueDate?: string;

  @ApiProperty({ example: 0, description: 'Order within a status/column' })
  sortOrder!: number;

  @ApiProperty({ example: 'd986e563-ebf7-4af2-adcf-205e83291501', required: false })
  templateId?: string;

  @ApiProperty({ example: '2025-12-15T12:00:00.000Z', required: false })
  createdAt?: string;

  @ApiProperty({ example: '2025-12-15T12:10:00.000Z', required: false })
  updatedAt?: string;
}
