import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RouteTimerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const timerStart = Date.now();
    const method = context.getHandler().name;
    const className = context.getClass().name;
    return next.handle().pipe(
      tap(() => {
        const timerEnd = Date.now() - timerStart;
        console.log(`LOG ${className} - ${method} - ${timerEnd} ms`);
      }),
    );
  }
}
