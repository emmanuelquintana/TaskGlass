import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { SavedViewIdParamDto } from './dto/saved-view-id.param.dto';
import { UpdateSavedViewDto } from './dto/update-saved-view.dto';
import { SavedViewService } from './saved-view.service';
import { SavedViewModel } from './models/saved-view.model';

@ApiTags('saved-views')
@Controller('saved-views')
export class SavedViewsController {
  constructor(private readonly savedViewService: SavedViewService) {}

  @Get(':id')
  @ApiParam({ name: 'id', example: 'c9b2f6a4-2d34-4d43-8db4-0c5dfd2f7a62' })
  @ResponseCode('TG_SV_200')
  @ApiOkResponseWrapped(SavedViewModel)
  async get(@Param() p: SavedViewIdParamDto): Promise<SavedViewModel> {
    return this.savedViewService.getById(p.id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'c9b2f6a4-2d34-4d43-8db4-0c5dfd2f7a62' })
  @ApiBody({
    type: UpdateSavedViewDto,
    examples: {
      updateName: { summary: 'Rename view', value: { name: 'Liverpool - Urgent' } },
      updateFilters: {
        summary: 'Update filters',
        value: { filters: { tags: { platform: ['liverpool'] }, priority: [1, 2], status: ['todo'] } }
      }
    }
  })
  @ResponseCode('TG_SV_200')
  @ApiOkResponseWrapped(SavedViewModel)
  async update(@Param() p: SavedViewIdParamDto, @Body() dto: UpdateSavedViewDto): Promise<SavedViewModel> {
    return this.savedViewService.update(p.id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'c9b2f6a4-2d34-4d43-8db4-0c5dfd2f7a62' })
  @ResponseCode('TG_SV_200')
  async remove(@Param() p: SavedViewIdParamDto): Promise<{ id: string }> {
    return this.savedViewService.remove(p.id);
  }
}
