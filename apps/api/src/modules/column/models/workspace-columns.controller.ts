import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ColumnService } from './column.service';
import { ResponseCode } from 'src/common/decorators/response-code.decorator';
import { ColumnModel } from './column.model';
import { ApiOkResponseWrapped } from 'src/common/response/swagger-response.decorator';
import { WorkspaceIdParamDto } from '../dto/workspace-id.param.dto';



@ApiTags('columns')
@Controller('workspaces/:workspaceId/columns')
export class WorkspaceColumnsController {
    constructor(private readonly columnService: ColumnService) { }

    @Get()
    @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    @ResponseCode('TG_COL_200')
    @ApiOkResponseWrapped(ColumnModel)
    async list(@Param() p: WorkspaceIdParamDto): Promise<ColumnModel[]> {
        return this.columnService.listByWorkspace(p.workspaceId);
    }
}
