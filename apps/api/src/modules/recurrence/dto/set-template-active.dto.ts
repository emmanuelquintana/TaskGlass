import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetTemplateActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}
