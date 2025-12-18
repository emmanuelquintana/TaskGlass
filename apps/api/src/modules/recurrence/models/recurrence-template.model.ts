import { ApiProperty } from '@nestjs/swagger';

export class RecurrenceTemplateModel {
  @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  id!: string;

  @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  workspaceId!: string;

  @ApiProperty({ example: 'Review invoices' })
  title!: string;

  @ApiProperty({ required: false, example: 'Check new invoices in the morning' })
  description?: string;

  @ApiProperty({ example: 'todo' })
  statusDefault!: string;

  @ApiProperty({ example: 3 })
  priority!: number;

  @ApiProperty({ example: 'daily' })
  cadence!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ required: false, example: '2025-12-15T12:00:00.000Z' })
  createdAt?: string;

  @ApiProperty({ required: false, example: '2025-12-15T12:10:00.000Z' })
  updatedAt?: string;
}
