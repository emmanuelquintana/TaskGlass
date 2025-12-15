import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadata } from './pagination-metadata';

export class ApiResponse<TData = unknown> {
  @ApiProperty({ example: 'TG_WS_200' })
  code: string;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 'c49c5368e1c7a6b5' })
  traceId: string;

  @ApiProperty({ type: Object })
  data: TData;

  @ApiProperty({ type: PaginationMetadata })
  metadata: PaginationMetadata;

  constructor(init: ApiResponse<TData>) {
    this.code = init.code;
    this.message = init.message;
    this.traceId = init.traceId;
    this.data = init.data;
    this.metadata = init.metadata;
  }
}
