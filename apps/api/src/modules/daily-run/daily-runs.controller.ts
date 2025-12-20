import { Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { DailyRunService } from './daily-run.service';
import { ListDailyRunsQueryDto } from './dto/list-daily-runs.query.dto';
import { WorkspaceDateParamDto } from './dto/workspace-date.param.dto';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { DailyRunModel } from './models/daily-run.model';
import { GenerateDailyRunTasksResultModel } from './dto/generate-daily-run-tasks-result.model';

@ApiTags('daily-runs')
@Controller('workspaces')
export class DailyRunsController {
  constructor(private readonly dailyRunService: DailyRunService) { }

  @Get(':workspaceId/daily-runs')
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiQuery({ name: 'from', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-12-31' })
  @ResponseCode('TG_DR_200')
  @ApiOkResponseWrapped(DailyRunModel)
  async list(@Param() p: WorkspaceIdParamDto, @Query() q: ListDailyRunsQueryDto): Promise<DailyRunModel[]> {
    return this.dailyRunService.list(p.workspaceId, q.from, q.to);
  }

  @Get(':workspaceId/daily-runs/:runDate')
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiParam({ name: 'runDate', example: '2025-12-20' })
  @ResponseCode('TG_DR_200')
  @ApiOkResponseWrapped(DailyRunModel)
  async get(@Param() p: WorkspaceDateParamDto): Promise<DailyRunModel> {
    return this.dailyRunService.get(p.workspaceId, p.runDate);
  }

  @Put(':workspaceId/daily-runs/:runDate')
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiParam({ name: 'runDate', example: '2025-12-20' })
  @ResponseCode('TG_DR_200')
  @ApiOkResponseWrapped(DailyRunModel)
  async upsert(@Param() p: WorkspaceDateParamDto): Promise<DailyRunModel> {
    return this.dailyRunService.upsert(p.workspaceId, p.runDate);
  }

  @Delete(':workspaceId/daily-runs/:runDate')
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiParam({ name: 'runDate', example: '2025-12-20' })
  @ResponseCode('TG_DR_200')
  async remove(@Param() p: WorkspaceDateParamDto): Promise<{ workspaceId: string; runDate: string }> {
    return this.dailyRunService.remove(p.workspaceId, p.runDate);
  }

}
