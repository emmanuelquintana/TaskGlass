import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { BoardQueryDto } from './dto/board-query.dto';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { BoardService } from './board.service';
import { BoardModel } from './models/board.model';

@ApiTags('board')
@Controller('workspaces/:workspaceId/board')
export class BoardController {
    constructor(private readonly boardService: BoardService) { }

    @Get()
    @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    @ResponseCode('TG_BD_200')
    @ApiOkResponseWrapped(BoardModel)
    async getBoard(@Param() p: WorkspaceIdParamDto, @Query() q: BoardQueryDto): Promise<BoardModel> {
        return this.boardService.getBoard(p.workspaceId, q.date);
    }
}
