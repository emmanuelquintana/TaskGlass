import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReplaceTaskTagsDto {
  @ApiProperty({ example: ['a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4'] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  tagIds!: string[];
}
