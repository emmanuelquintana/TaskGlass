import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseCode } from '../../common/decorators/response-code.decorator';
import { ApiOkResponseWrapped } from '../../common/response/swagger-response.decorator';
import { WorkspaceIdParamDto } from './dto/workspace-id.param.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceModel } from './models/workspace.model';
import { WorkspaceService } from './workspace.service';

@ApiTags('workspaces')
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) { }

  @Get()
  @ResponseCode('TG_WS_200')
  @ApiOkResponseWrapped(WorkspaceModel)
  async list(): Promise<WorkspaceModel[]> {
    return this.workspaceService.list();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
  @ResponseCode('TG_WS_200')
  @ApiOkResponseWrapped(WorkspaceModel)
  async getById(@Param() p: WorkspaceIdParamDto): Promise<WorkspaceModel> {
    return this.workspaceService.getById(p.id);
  }

  @Post()
  @ApiBody({ type: CreateWorkspaceDto })
  @ResponseCode('TG_WS_201')
  @ApiOkResponseWrapped(WorkspaceModel)
  async create(@Body() dto: CreateWorkspaceDto): Promise<WorkspaceModel> {
    return this.workspaceService.create(dto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
  @ApiBody({ type: UpdateWorkspaceDto })
  @ResponseCode('TG_WS_200')
  @ApiOkResponseWrapped(WorkspaceModel)
  async update(
    @Param() p: WorkspaceIdParamDto,
    @Body() dto: UpdateWorkspaceDto
  ): Promise<WorkspaceModel> {
    return this.workspaceService.update(p.id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
  @ResponseCode('TG_WS_200')
  async remove(@Param() p: WorkspaceIdParamDto): Promise<{ id: string }> {
    return this.workspaceService.remove(p.id);
  }
}
