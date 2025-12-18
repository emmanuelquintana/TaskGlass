import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TaskIdParamDto {
  @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @IsUUID('4')
  id!: string;
}
