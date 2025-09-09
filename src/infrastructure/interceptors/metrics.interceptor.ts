import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const route = this.getRoute(request);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpDuration(method, route, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpDuration(method, route, duration);
          this.metricsService.incrementErrors('http_error', route);
        },
      }),
    );
  }

  private getRoute(request: Request): string {
    // Tentar extrair a rota do handler ou usar o path
    if (request.route?.path) {
      return request.route.path;
    }

    // Fallback para pathname, removendo query parameters
    const pathname = request.url.split('?')[0];

    // Normalizar rotas com IDs para evitar alta cardinalidade
    return pathname
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[A-Z]{3}/g, '/:iata'); // Códigos IATA
  }
}
