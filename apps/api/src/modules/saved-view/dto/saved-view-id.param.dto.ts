import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SavedViewIdParamDto {
  @ApiProperty({ example: 'c9b2f6a4-2d34-4d43-8db4-0c5dfd2f7a62' })
  @IsUUID('4')
  id!: string;
}
