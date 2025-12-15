import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
    @ApiProperty({ example: 'Operaciones', required: false, maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @ApiProperty({
        example: 'Operación diaria + marketplaces + sitios + clientes',
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
