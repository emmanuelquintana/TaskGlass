import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { RecurrenceService } from './recurrence.service';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { CreateRecurrenceTemplateDto } from './dto/create-template.dto';
import { RecurrenceTemplateModel } from './models/recurrence-template.model';

@ApiTags('recurrence')
@Controller('workspaces/:workspaceId/recurrence-templates')
export class WorkspaceRecurrenceTemplatesController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Get()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ResponseCode('TG_RT_200')
  @ApiOkResponseWrapped(RecurrenceTemplateModel)
  async list(@Param() p: WorkspaceIdParamDto): Promise<RecurrenceTemplateModel[]> {
    return this.recurrenceService.listTemplates(p.workspaceId);
  }

  @Post()
  @ApiParam({ name: 'workspaceId', example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
  @ApiBody({ type: CreateRecurrenceTemplateDto })
  @ResponseCode('TG_RT_201')
  @ApiOkResponseWrapped(RecurrenceTemplateModel)
  async create(
    @Param() p: WorkspaceIdParamDto,
    @Body() dto: CreateRecurrenceTemplateDto
  ): Promise<RecurrenceTemplateModel> {
    return this.recurrenceService.createTemplate(p.workspaceId, dto);
  }
}
