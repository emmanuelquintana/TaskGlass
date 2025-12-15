import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { TgLogger } from '../logger/tg-logger';

/**
 * RequestLoggerInterceptor logs request start/end with traceId and duration.
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
    private readonly logger = new TgLogger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();

        const traceId = req?.traceId ?? '';
        const method = req?.method ?? '';
        const path = req?.originalUrl ?? req?.url ?? '';
        const start = Date.now();

        // Skip swagger noise if you want
        if (String(path).startsWith('/swagger')) {
            return next.handle();
        }

        this.logger.log('request.start', {
            traceId,
            method,
            path
        });

        return next.handle().pipe(
            catchError((err) => {
                // We don't print the full error here; the exception filter will handle it.
                this.logger.warn('request.error', {
                    traceId,
                    method,
                    path
                });
                return throwError(() => err);
            }),
            finalize(() => {
                const ms = Date.now() - start;
                const statusCode = res?.statusCode ?? 0;

                this.logger.log('request.end', {
                    traceId,
                    method,
                    path,
                    statusCode,
                    ms
                });
            })
        );
    }
}
