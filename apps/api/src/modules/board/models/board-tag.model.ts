import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BoardTagModel {
    @ApiProperty({ example: '2b6f8d42-3e1f-4a7d-9a7a-0e6ed2f86d61' })
    id!: string;

    @ApiProperty({ example: 'marketplace' })
    groupKey!: string;

    @ApiProperty({ example: 'liverpool' })
    name!: string;

    @ApiPropertyOptional({ example: '#FF6B6B' })
    color?: string | null;
}
