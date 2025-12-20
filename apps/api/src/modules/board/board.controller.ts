import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { BoardService } from './board.service';
import { BoardModel } from './models/board.model';
import { BoardQueryDto } from './dto/board-query.dto';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';

@ApiTags('board')
@Controller('workspaces')
export class BoardController {
    constructor(private readonly boardService: BoardService) { }

    @Get(':workspaceId/board')
    @ApiParam({ name: 'workspaceId', example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
    @ResponseCode('TG_BD_200')
    @ApiOkResponseWrapped(BoardModel)
    async getBoard(@Param() p: WorkspaceIdParamDto, @Query() q: BoardQueryDto): Promise<BoardModel> {
        return this.boardService.getBoard(p.workspaceId, q.runDate);
    }
}
