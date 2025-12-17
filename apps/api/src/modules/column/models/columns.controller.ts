import { Body, Controller, Patch, Param, Put } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ColumnService } from './column.service';
import { ColumnModel } from './column.model';
import { ColumnIdParamDto } from '../dto/column-id.param.dto';
import { ApiOkResponseWrapped } from 'src/common/response/swagger-response.decorator';
import { ResponseCode } from 'src/common/decorators/response-code.decorator';
import { UpdateColumnTitleDto } from '../dto/update-column-title.dto';
import { UpdateColumnSortOrderDto } from '../dto/update-column-sort-order.dto';
import { UpdateColumnSortOrdersDto } from '../dto/update-column-sort-orders.dto';

@ApiTags('columns')
@Controller('columns')
export class ColumnsController {
    constructor(private readonly columnService: ColumnService) { }

    @Patch(':id')
    @ApiParam({ name: 'id', example: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2' })
    @ApiBody({ type: UpdateColumnTitleDto })
    @ResponseCode('TG_COL_200')
    @ApiOkResponseWrapped(ColumnModel)
    async updateTitle(@Param() p: ColumnIdParamDto, @Body() dto: UpdateColumnTitleDto): Promise<ColumnModel> {
        return this.columnService.updateTitle(p.id, dto);
    }

    @Patch(':id/sort-order')
    @ApiParam({ name: 'id', example: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2' })
    @ApiBody({ type: UpdateColumnSortOrderDto })
    @ResponseCode('TG_COL_200')
    @ApiOkResponseWrapped(ColumnModel)
    async updateSortOrder(
        @Param() p: ColumnIdParamDto,
        @Body() dto: UpdateColumnSortOrderDto
    ): Promise<ColumnModel> {
        return this.columnService.updateSortOrder(p.id, dto);
    }

    @Put('sort-order')
    @ApiBody({ type: UpdateColumnSortOrdersDto })
    @ResponseCode('TG_COL_200')
    @ApiOkResponseWrapped(ColumnModel)
    async updateSortOrdersBatch(@Body() dto: UpdateColumnSortOrdersDto): Promise<ColumnModel[]> {
        return this.columnService.updateSortOrdersBatch(dto);
    }
}
