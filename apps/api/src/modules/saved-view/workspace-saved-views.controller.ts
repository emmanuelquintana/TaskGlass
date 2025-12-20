import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { CreateSavedViewDto } from './dto/create-saved-view.dto';
import { SavedViewService } from './saved-view.service';
import { SavedViewModel } from './models/saved-view.model';

@ApiTags('saved-views')
@Controller('workspaces/:workspaceId/saved-views')
export class WorkspaceSavedViewsController {
  constructor(private readonly savedViewService: SavedViewService) {}

  @Get()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ResponseCode('TG_SV_200')
  @ApiOkResponseWrapped(SavedViewModel)
  async list(@Param() p: WorkspaceIdParamDto): Promise<SavedViewModel[]> {
    return this.savedViewService.listByWorkspace(p.workspaceId);
  }

  @Post()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiBody({
    type: CreateSavedViewDto,
    examples: {
      liverpoolToday: {
        summary: 'Liverpool - Today',
        value: {
          name: 'Liverpool - Today',
          filters: { tags: { platform: ['liverpool'] }, status: ['todo', 'in_progress'], dueDate: 'today' },
          sort: { by: 'priority', dir: 'desc' }
        }
      }
    }
  })
  @ResponseCode('TG_SV_201')
  @ApiOkResponseWrapped(SavedViewModel)
  async create(@Param() p: WorkspaceIdParamDto, @Body() dto: CreateSavedViewDto): Promise<SavedViewModel> {
    return this.savedViewService.create(p.workspaceId, dto);
  }
}
