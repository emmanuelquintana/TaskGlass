import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_CODE_KEY } from '../decorators/response-code.decorator';
import { ApiResponseBuilder } from '../response/api-response.builder';
import { PaginationMetadata } from '../response/pagination-metadata';

type PagedPayload<T = unknown> = {
  items: T[];
  metadata?: PaginationMetadata;
};

@Injectable()
export class ResponseWrapInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const path = String(req?.url ?? '');

    if (path.startsWith('/swagger')) {
      return next.handle();
    }

    const handler = context.getHandler();
    const code = this.reflector.get<string>(RESPONSE_CODE_KEY, handler) ?? 'TG_CORE_200';
    const traceId = req.traceId ?? '';

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
          const paged = data as PagedPayload;
          const items = paged.items ?? [];
          const meta =
            paged.metadata ??
            new PaginationMetadata(0, 0, Array.isArray(items) ? items.length : 0);

          return ApiResponseBuilder.create()
            .code(code)
            .message('Success')
            .traceId(traceId)
            .data(items)
            .metadata(meta)
            .build();
        }

        const payload = data ?? {};
        const elements = Array.isArray(payload) ? payload.length : 0;

        return ApiResponseBuilder.create()
          .code(code)
          .message('Success')
          .traceId(traceId)
          .data(payload)
          .metadata(new PaginationMetadata(0, 0, elements))
          .build();
      })
    );
  }
}
