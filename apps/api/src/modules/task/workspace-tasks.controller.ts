import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { TaskService } from './task.service';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { ListTasksQueryDto } from './dto/list-tasks.query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskModel } from './models/task.model';

@ApiTags('tasks')
@Controller('workspaces/:workspaceId/tasks')
export class WorkspaceTasksController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ResponseCode('TG_TS_200')
  @ApiOkResponseWrapped(TaskModel)
  async list(@Param() p: WorkspaceIdParamDto, @Query() q: ListTasksQueryDto): Promise<unknown> {
    const page = q.page ?? 0;
    const size = q.size ?? 50;

    return this.taskService.listByWorkspace(p.workspaceId, {
      status: q.status,
      q: q.q,
      page,
      size
    });
  }

  @Post()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiBody({ type: CreateTaskDto })
  @ResponseCode('TG_TS_201')
  @ApiOkResponseWrapped(TaskModel)
  async create(@Param() p: WorkspaceIdParamDto, @Body() dto: CreateTaskDto): Promise<TaskModel> {
    return this.taskService.create(p.workspaceId, dto);
  }
}
