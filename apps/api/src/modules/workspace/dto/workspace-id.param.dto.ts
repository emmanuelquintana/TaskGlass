import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class WorkspaceIdParamDto {
  @ApiProperty({
    example: '48c1681d-7a02-4fe1-8926-0013f25348f1',
    description: 'Workspace UUID'
  })
  @IsUUID()
  id!: string;
}
