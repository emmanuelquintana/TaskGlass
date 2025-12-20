import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TagIdParamDto {
  @ApiProperty({ example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @IsUUID('4')
  id!: string;
}
