import { ApiProperty } from '@nestjs/swagger';

export class SavedViewModel {
  @ApiProperty({ example: 'c9b2f6a4-2d34-4d43-8db4-0c5dfd2f7a62' })
  id!: string;

  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  @ApiProperty({ example: 'Liverpool - Today' })
  name!: string;

  @ApiProperty({
    example: { tags: { platform: ['liverpool'] }, status: ['todo', 'in_progress'], dueDate: 'today' }
  })
  filters!: Record<string, unknown>;

  @ApiProperty({
    example: { by: 'priority', dir: 'desc' }
  })
  sort!: Record<string, unknown>;

  @ApiProperty({ example: '2025-12-15T12:00:00.000Z', required: false })
  createdAt?: string;

  @ApiProperty({ example: '2025-12-15T12:10:00.000Z', required: false })
  updatedAt?: string;
}
