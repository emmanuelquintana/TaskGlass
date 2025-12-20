import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { ListTagsQueryDto } from './dto/list-tags.query.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagModel } from './models/tag.model';
import { TagService } from './tag.service';

@ApiTags('tags')
@Controller('workspaces/:workspaceId/tags')
export class WorkspaceTagsController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ResponseCode('TG_TG_200')
  @ApiOkResponseWrapped(TagModel)
  async list(@Param() p: WorkspaceIdParamDto, @Query() q: ListTagsQueryDto): Promise<TagModel[]> {
    return this.tagService.listByWorkspace(p.workspaceId, q);
  }

  @Post()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiBody({ type: CreateTagDto })
  @ResponseCode('TG_TG_201')
  @ApiOkResponseWrapped(TagModel)
  async create(@Param() p: WorkspaceIdParamDto, @Body() dto: CreateTagDto): Promise<TagModel> {
    return this.tagService.create(p.workspaceId, dto);
  }
}
