import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateColumnTitleDto {
    @ApiProperty({ example: 'Pending', maxLength: 80 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    title!: string;
}
