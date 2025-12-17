import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ColumnIdParamDto {
    @ApiProperty({
        example: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2',
        description: 'Column UUID v4'
    })
    @IsUUID('4')
    id!: string;
}
