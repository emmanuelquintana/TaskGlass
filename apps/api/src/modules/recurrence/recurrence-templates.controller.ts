import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { RecurrenceService } from './recurrence.service';
import { TemplateIdParamDto } from './dto/template-id.param.dto';
import { UpdateRecurrenceTemplateDto } from './dto/update-template.dto';
import { SetTemplateActiveDto } from './dto/set-template-active.dto';
import { RecurrenceTemplateModel } from './models/recurrence-template.model';

@ApiTags('recurrence')
@Controller('recurrence-templates')
export class RecurrenceTemplatesController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Get(':id')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ResponseCode('TG_RT_200')
  @ApiOkResponseWrapped(RecurrenceTemplateModel)
  async get(@Param() p: TemplateIdParamDto): Promise<RecurrenceTemplateModel> {
    return this.recurrenceService.getTemplate(p.id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: UpdateRecurrenceTemplateDto })
  @ResponseCode('TG_RT_200')
  @ApiOkResponseWrapped(RecurrenceTemplateModel)
  async update(
    @Param() p: TemplateIdParamDto,
    @Body() dto: UpdateRecurrenceTemplateDto
  ): Promise<RecurrenceTemplateModel> {
    return this.recurrenceService.updateTemplate(p.id, dto);
  }

  @Patch(':id/active')
  @ApiParam({ name: 'id', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: SetTemplateActiveDto })
  @ResponseCode('TG_RT_200')
  @ApiOkResponseWrapped(RecurrenceTemplateModel)
  async setActive(@Param() p: TemplateIdParamDto, @Body() dto: SetTemplateActiveDto): Promise<RecurrenceTemplateModel> {
    return this.recurrenceService.setTemplateActive(p.id, dto);
  }
}
