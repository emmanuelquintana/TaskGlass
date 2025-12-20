import { ApiProperty } from '@nestjs/swagger';

export class TagModel {
  @ApiProperty({ example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  id!: string;

  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  @ApiProperty({ example: 'platform', description: 'Tag group, e.g. platform | brand | channel | client' })
  groupKey!: string;

  @ApiProperty({ example: 'amazon' })
  name!: string;

  @ApiProperty({ example: '#22c55e', required: false })
  color?: string;

  @ApiProperty({ example: '2025-12-15T12:00:00.000Z', required: false })
  createdAt?: string;

  @ApiProperty({ example: '2025-12-15T12:10:00.000Z', required: false })
  updatedAt?: string;
}
