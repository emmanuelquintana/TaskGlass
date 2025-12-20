import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { TagIdParamDto } from './dto/tag-id.param.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagModel } from './models/tag.model';
import { TagService } from './tag.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagService) {}

  @Get(':id')
  @ApiParam({ name: 'id', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_TG_200')
  @ApiOkResponseWrapped(TagModel)
  async get(@Param() p: TagIdParamDto): Promise<TagModel> {
    return this.tagService.getById(p.id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ApiBody({ type: UpdateTagDto })
  @ResponseCode('TG_TG_200')
  @ApiOkResponseWrapped(TagModel)
  async update(@Param() p: TagIdParamDto, @Body() dto: UpdateTagDto): Promise<TagModel> {
    return this.tagService.update(p.id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'a2a4e3f6-9c3d-4a25-9e56-6ad5a1f2b3c4' })
  @ResponseCode('TG_TG_200')
  async remove(@Param() p: TagIdParamDto): Promise<{ id: string }> {
    return this.tagService.remove(p.id);
  }
}
