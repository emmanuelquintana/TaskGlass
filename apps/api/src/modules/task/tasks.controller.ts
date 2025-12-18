import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { TaskService } from './task.service';
import { TaskIdParamDto } from './dto/task-id.param.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusDto } from './dto/task-status.dto';
import { TaskModel } from './models/task.model';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ResponseCode('TG_TS_200')
  @ApiOkResponseWrapped(TaskModel)
  async getById(@Param() p: TaskIdParamDto): Promise<TaskModel> {
    return this.taskService.getById(p.id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: UpdateTaskDto })
  @ResponseCode('TG_TS_200')
  @ApiOkResponseWrapped(TaskModel)
  async update(@Param() p: TaskIdParamDto, @Body() dto: UpdateTaskDto): Promise<TaskModel> {
    return this.taskService.update(p.id, dto);
  }

  @Patch(':id/status')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: TaskStatusDto })
  @ResponseCode('TG_TS_200')
  @ApiOkResponseWrapped(TaskModel)
  async updateStatus(@Param() p: TaskIdParamDto, @Body() dto: TaskStatusDto): Promise<TaskModel> {
    return this.taskService.updateStatus(p.id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ResponseCode('TG_TS_200')
  async remove(@Param() p: TaskIdParamDto): Promise<{ id: string }> {
    return this.taskService.remove(p.id);
  }
}
