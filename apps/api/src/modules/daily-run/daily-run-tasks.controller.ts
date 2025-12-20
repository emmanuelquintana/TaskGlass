import { Controller, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { WorkspaceDateParamDto } from './dto/workspace-date.param.dto';
import { GenerateDailyRunTasksResultModel } from './dto/generate-daily-run-tasks-result.model';
import { DailyRunTasksService } from './daily-run-tasks.service';

@ApiTags('daily-run-tasks')
@Controller('workspaces/:workspaceId/daily-runs/:runDate/tasks')
export class DailyRunTasksController {
  constructor(private readonly dailyRunTasksService: DailyRunTasksService) { }

  /**
   * RESTful generation: creating the collection of "daily tasks" for a given day.
   */
  @Post()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiParam({ name: 'runDate', example: '2025-12-20' })
  @ResponseCode('TG_DRT_201')
  @ApiOkResponseWrapped(GenerateDailyRunTasksResultModel)
  async generate(@Param() p: WorkspaceDateParamDto): Promise<GenerateDailyRunTasksResultModel> {
    return this.dailyRunTasksService.generate(p.workspaceId, p.runDate);
  }
}
