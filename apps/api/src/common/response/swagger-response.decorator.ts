import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse } from './api-response';
import { PaginationMetadata } from './pagination-metadata';

export function ApiOkResponseWrapped<TModel extends Type<unknown>>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(ApiResponse, PaginationMetadata, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          { properties: { data: { $ref: getSchemaPath(model) } } }
        ]
      }
    })
  );
}
