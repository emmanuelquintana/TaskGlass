import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { TagModel } from './models/tag.model';
import { TagService } from './tag.service';
import { TaskIdParamDto } from './dto/task-id.param.dto';
import { TaskTagParamDto } from './dto/task-tag.param.dto';
import { ReplaceTaskTagsDto } from './dto/replace-task-tags.dto';

@ApiTags('task-tags')
@Controller('tasks')
export class TaskTagsController {
  constructor(private readonly tagService: TagService) {}

  @Get(':taskId/tags')
  @ApiParam({ name: 'taskId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ResponseCode('TG_TT_200')
  @ApiOkResponseWrapped(TagModel)
  async list(@Param() p: TaskIdParamDto): Promise<TagModel[]> {
    return this.tagService.listTagsByTask(p.taskId);
  }

  @Post(':taskId/tags/:tagId')
  @ApiParam({ name: 'taskId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiParam({ name: 'tagId', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_TT_200')
  async attach(@Param() p: TaskTagParamDto): Promise<{ taskId: string; tagId: string }> {
    return this.tagService.attachTagToTask(p.taskId, p.tagId);
  }

  @Delete(':taskId/tags/:tagId')
  @ApiParam({ name: 'taskId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiParam({ name: 'tagId', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_TT_200')
  async detach(@Param() p: TaskTagParamDto): Promise<{ taskId: string; tagId: string }> {
    return this.tagService.detachTagFromTask(p.taskId, p.tagId);
  }

  @Put(':taskId/tags')
  @ApiParam({ name: 'taskId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: ReplaceTaskTagsDto })
  @ResponseCode('TG_TT_200')
  @ApiOkResponseWrapped(TagModel)
  async replace(@Param() p: TaskIdParamDto, @Body() dto: ReplaceTaskTagsDto): Promise<TagModel[]> {
    return this.tagService.replaceTaskTags(p.taskId, dto);
  }
}
