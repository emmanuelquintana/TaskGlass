import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class WorkspaceIdParamDto {
    @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    @IsUUID()
    workspaceId!: string;
}
