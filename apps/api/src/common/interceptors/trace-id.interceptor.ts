import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { generateTraceId } from '../utils/trace-id';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const incoming = req.headers['x-trace-id'];
    const traceId = typeof incoming === 'string' && incoming.length > 0 ? incoming : generateTraceId();

    req.traceId = traceId;
    res.setHeader('x-trace-id', traceId);

    return next.handle();
  }
}
