import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RouteTimerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RouteTimer');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const timerStart = Date.now();
    const req = context.switchToHttp().getRequest();
    const httpMethod = req?.method || '';
    const url = req?.url || '';
    const handler = context.getHandler().name;
    const className = context.getClass().name;

    return next.handle().pipe(
      tap(() => {
        const timerEnd = Date.now() - timerStart;
        this.logger.log(`${httpMethod} ${url} [${className}#${handler}] - ${timerEnd}ms`);
      }),
    );
  }
}
