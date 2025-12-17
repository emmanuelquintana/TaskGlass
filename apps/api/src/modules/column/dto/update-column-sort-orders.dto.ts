import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ColumnSortOrderItemDto } from './update-column-sort-orders.item.dto';

export class UpdateColumnSortOrdersDto {
    @ApiProperty({
        example: {
            items: [
                { id: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2', sortOrder: 1 },
                { id: 'd6a16a8f-1a68-4d9a-bf2c-2c3e0f7d8e90', sortOrder: 2 },
                { id: '4bfa8408-3b78-4f4a-a0f5-3e0f55cbb35f', sortOrder: 3 },
                { id: '9c2a7bb8-3e12-4f12-88aa-1a2c5b7d9e11', sortOrder: 4 }
            ]
        }
    })
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ColumnSortOrderItemDto)
    items!: ColumnSortOrderItemDto[];
}
