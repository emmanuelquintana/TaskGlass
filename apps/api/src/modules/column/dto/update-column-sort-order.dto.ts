import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateColumnSortOrderDto {
    @ApiProperty({ example: 2, minimum: 1 })
    @IsInt()
    @Min(1)
    sortOrder!: number;
}
