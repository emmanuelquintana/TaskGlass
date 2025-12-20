import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { TagModel } from '../tag/models/tag.model';
import { ReplaceTemplateTagsDto } from './dto/replace-template-tags.dto';
import { TemplateIdParamDto } from './dto/template-id.param.dto';
import { TemplateTagParamDto } from './dto/template-tag.param.dto';
import { RecurrenceTemplateTagService } from './recurrence-template-tag.service';

@ApiTags('recurrence-template-tags')
@Controller('recurrence-templates')
export class RecurrenceTemplateTagsController {
  constructor(private readonly templateTagService: RecurrenceTemplateTagService) {}

  @Get(':templateId/tags')
  @ApiParam({ name: 'templateId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ResponseCode('TG_RTT_200')
  @ApiOkResponseWrapped(TagModel)
  async list(@Param() p: TemplateIdParamDto): Promise<TagModel[]> {
    return this.templateTagService.listTagsByTemplate(p.templateId);
  }

  @Post(':templateId/tags/:tagId')
  @ApiParam({ name: 'templateId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiParam({ name: 'tagId', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_RTT_200')
  async attach(@Param() p: TemplateTagParamDto): Promise<{ templateId: string; tagId: string }> {
    return this.templateTagService.attach(p.templateId, p.tagId);
  }

  @Delete(':templateId/tags/:tagId')
  @ApiParam({ name: 'templateId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiParam({ name: 'tagId', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_RTT_200')
  async detach(@Param() p: TemplateTagParamDto): Promise<{ templateId: string; tagId: string }> {
    return this.templateTagService.detach(p.templateId, p.tagId);
  }

  @Put(':templateId/tags')
  @ApiParam({ name: 'templateId', example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @ApiBody({ type: ReplaceTemplateTagsDto })
  @ResponseCode('TG_RTT_200')
  @ApiOkResponseWrapped(TagModel)
  async replace(@Param() p: TemplateIdParamDto, @Body() dto: ReplaceTemplateTagsDto): Promise<TagModel[]> {
    return this.templateTagService.replace(p.templateId, dto);
  }
}
