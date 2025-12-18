import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { RecurrenceService } from './recurrence.service';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { RunDailyDto } from './dto/run-daily.dto';
import { DailyRunResultModel } from './models/daily-run-result.model';

function formatDateYYYYMMDD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@ApiTags('recurrence')
@Controller('workspaces/:workspaceId/daily-runs')
export class WorkspaceDailyRunsController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post('run')
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiBody({ type: RunDailyDto })
  @ResponseCode('TG_DR_200')
  @ApiOkResponseWrapped(DailyRunResultModel)
  async run(@Param() p: WorkspaceIdParamDto, @Body() dto: RunDailyDto): Promise<DailyRunResultModel> {
    const runDate = dto?.runDate ?? formatDateYYYYMMDD(new Date());
    return this.recurrenceService.runDaily(p.workspaceId, runDate);
  }
}
