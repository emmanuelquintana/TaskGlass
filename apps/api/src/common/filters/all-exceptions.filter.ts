import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseBuilder } from '../response/api-response.builder';
import { AppException } from '../errors/app.exception';
import { errorCodes } from '../errors/error-codes';
import { TgLogger } from '../logger/tg-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new TgLogger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const traceId = req?.traceId ?? '';
    const method = req?.method ?? '';
    const path = req?.originalUrl ?? req?.url ?? '';

    const err: any = exception;

    this.logger.error('exception.caught', {
      traceId,
      method,
      path,
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });

    if (exception instanceof AppException) {
      res.status(exception.getStatus()).json(
        ApiResponseBuilder.create()
          .code(exception.code)
          .message(exception.message)
          .traceId(traceId)
          .data({})
          .build()
      );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const codeByStatus: Record<number, string> = {
        400: errorCodes.core.badRequest,
        401: errorCodes.core.unauthorized,
        403: errorCodes.core.forbidden,
        404: errorCodes.core.notFound
      };

      res.status(status).json(
        ApiResponseBuilder.create()
          .code(codeByStatus[status] ?? `TG_CORE_${status}`)
          .message(exception.message)
          .traceId(traceId)
          .data({})
          .build()
      );
      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      ApiResponseBuilder.create()
        .code(errorCodes.core.internalServerError)
        .message('Unhandled error')
        .traceId(traceId)
        .data({})
        .build()
    );
  }
}
