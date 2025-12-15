import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
    @ApiProperty({ example: 'BANK', description: 'Unique workspace code', maxLength: 32 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    code!: string;

    @ApiProperty({ example: 'Banco', description: 'Workspace name', maxLength: 120 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name!: string;

    @ApiProperty({
        example: 'Trabajo del banco (sprints cada 2 semanas)',
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
