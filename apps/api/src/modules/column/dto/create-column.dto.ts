import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength, Min } from 'class-validator';

export class CreateColumnDto {
    @ApiProperty({ example: 'To Do', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    title!: string;

    @ApiProperty({ example: 'todo', description: 'Unique key for status mapping', maxLength: 32 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    key!: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
