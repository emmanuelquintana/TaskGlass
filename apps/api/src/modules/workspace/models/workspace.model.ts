import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceModel {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'OPS' })
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description?: string;
}
