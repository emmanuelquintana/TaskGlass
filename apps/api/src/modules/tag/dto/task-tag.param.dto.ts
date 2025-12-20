import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TaskTagParamDto {
  @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @IsUUID('4')
  taskId!: string;

  @ApiProperty({ example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @IsUUID('4')
  tagId!: string;
}
