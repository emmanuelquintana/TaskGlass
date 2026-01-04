import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';

export class UpdateColumnSortItemDto {
    @ApiProperty()
    @IsUUID()
    id!: string;

    @ApiProperty()
    @IsInt()
    sortOrder!: number;
}

export class UpdateColumnSortOrderDto {
    @ApiProperty({ type: [UpdateColumnSortItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateColumnSortItemDto)
    items!: UpdateColumnSortItemDto[];
}
