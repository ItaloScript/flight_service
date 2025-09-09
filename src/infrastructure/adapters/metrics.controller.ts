import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({
    summary: 'Métricas da aplicação',
    description:
      'Endpoint para coleta de métricas do sistema no formato Prometheus. ' +
      'Inclui métricas de sistema (CPU, memória), HTTP (requests, duração), ' +
      'e métricas de negócio (flights, legs, bookings, searches).',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas em formato Prometheus',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/flights",status_code="200"} 42

# HELP flights_total Total number of flights in the system  
# TYPE flights_total gauge
flights_total 156

# HELP availability_searches_total Total number of availability searches
# TYPE availability_searches_total counter
availability_searches_total{origin="GRU",destination="BSB"} 23`,
        },
      },
    },
  })
  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async getMetrics(): Promise<string> {
    try {
      // Atualizar métricas de negócio antes de retornar
      await this.updateBusinessMetrics();

      // Retornar métricas no formato Prometheus
      return await this.metricsService.getMetrics();
    } catch (error) {
      this.metricsService.incrementErrors('metrics_collection', 'get_metrics');
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Resumo das métricas principais',
    description:
      'Endpoint que retorna um resumo das principais métricas em formato JSON para dashboards.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo das métricas principais',
    schema: {
      type: 'object',
      properties: {
        system: {
          type: 'object',
          properties: {
            uptime_seconds: { type: 'number', example: 3600 },
            memory_usage_mb: { type: 'number', example: 256 },
          },
        },
        business: {
          type: 'object',
          properties: {
            total_flights: { type: 'number', example: 156 },
            total_legs: { type: 'number', example: 1420 },
            total_bookings: { type: 'number', example: 89 },
            searches_today: { type: 'number', example: 23 },
          },
        },
        performance: {
          type: 'object',
          properties: {
            avg_response_time_ms: { type: 'number', example: 120 },
            requests_per_minute: { type: 'number', example: 45 },
            error_rate_percent: { type: 'number', example: 0.5 },
          },
        },
      },
    },
  })
  @Get('summary')
  async getMetricsSummary() {
    try {
      const [flightsCount, legsCount, bookingsCount] = await Promise.all([
        this.prisma.flight.count(),
        this.prisma.leg.count(),
        this.prisma.booking.count(),
      ]);

      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      return {
        system: {
          uptime_seconds: Math.floor(uptime),
          memory_usage_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          memory_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          node_version: process.version,
        },
        business: {
          total_flights: flightsCount,
          total_legs: legsCount,
          total_bookings: bookingsCount,
          database_status: 'connected',
        },
        performance: {
          avg_response_time_ms: 120, // Placeholder - seria calculado das métricas reais
          requests_per_minute: 45, // Placeholder - seria calculado das métricas reais
          error_rate_percent: 0.5, // Placeholder - seria calculado das métricas reais
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.metricsService.incrementErrors('metrics_summary', 'get_summary');
      throw error;
    }
  }

  private async updateBusinessMetrics(): Promise<void> {
    try {
      const [flightsCount, legsCount, bookingsData] = await Promise.all([
        this.prisma.flight.count(),
        this.prisma.leg.count(),
        this.prisma.booking.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
        }),
      ]);

      // Converter dados de booking para formato esperado
      const bookingsCount: { [status: string]: number } = {};
      bookingsData.forEach((item) => {
        bookingsCount[item.status] = item._count.id;
      });

      // Atualizar métricas
      await this.metricsService.updateBusinessMetrics(
        flightsCount,
        legsCount,
        bookingsCount,
      );

      // Atualizar métricas de conexões de banco (aproximação)
      this.metricsService.setDatabaseConnections(1); // Prisma pool size
    } catch (error) {
      console.error('Erro ao atualizar métricas de negócio:', error);
      this.metricsService.incrementErrors('metrics_update', 'business');
    }
  }
}
