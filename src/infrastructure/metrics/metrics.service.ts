import { Injectable } from '@nestjs/common';
import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly flightsTotal: Gauge<string>;
  private readonly legsTotal: Gauge<string>;
  private readonly bookingsTotal: Gauge<string>;
  private readonly availabilitySearches: Counter<string>;
  private readonly legGenerationTotal: Counter<string>;
  private readonly databaseConnectionsActive: Gauge<string>;
  private readonly errorRate: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register });

    // Métricas HTTP
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    // Métricas de negócio
    this.flightsTotal = new Gauge({
      name: 'flights_total',
      help: 'Total number of flights in the system',
      registers: [register],
    });

    this.legsTotal = new Gauge({
      name: 'legs_total',
      help: 'Total number of legs in the system',
      registers: [register],
    });

    this.bookingsTotal = new Gauge({
      name: 'bookings_total',
      help: 'Total number of bookings in the system',
      labelNames: ['status'],
      registers: [register],
    });

    this.availabilitySearches = new Counter({
      name: 'availability_searches_total',
      help: 'Total number of availability searches performed',
      labelNames: ['origin', 'destination'],
      registers: [register],
    });

    this.legGenerationTotal = new Counter({
      name: 'leg_generation_total',
      help: 'Total number of legs generated',
      labelNames: ['status'],
      registers: [register],
    });

    // Métricas de infraestrutura
    this.databaseConnectionsActive = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [register],
    });

    this.errorRate = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'operation'],
      registers: [register],
    });
  }

  incrementHttpRequests(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  observeHttpDuration(method: string, route: string, duration: number): void {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // Métricas de negócio
  setFlightsTotal(count: number): void {
    this.flightsTotal.set(count);
  }

  setLegsTotal(count: number): void {
    this.legsTotal.set(count);
  }

  setBookingsTotal(status: string, count: number): void {
    this.bookingsTotal.set({ status }, count);
  }

  incrementAvailabilitySearches(origin?: string, destination?: string): void {
    this.availabilitySearches.inc({
      origin: origin || 'unknown',
      destination: destination || 'unknown',
    });
  }

  incrementLegGeneration(status: 'success' | 'error', count: number = 1): void {
    this.legGenerationTotal.inc({ status }, count);
  }

  setDatabaseConnections(count: number): void {
    this.databaseConnectionsActive.set(count);
  }

  incrementErrors(type: string, operation: string): void {
    this.errorRate.inc({ type, operation });
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  updateBusinessMetrics(
    flightsCount: number,
    legsCount: number,
    bookingsCount: { [status: string]: number },
  ): void {
    this.setFlightsTotal(flightsCount);
    this.setLegsTotal(legsCount);

    Object.entries(bookingsCount).forEach(([status, count]) => {
      this.setBookingsTotal(status, count);
    });
  }

  incrementFlightDelays(): void {
    this.errorRate.inc({ type: 'delay', operation: 'flight' });
  }

  incrementCancellations(): void {
    this.errorRate.inc({ type: 'cancellation', operation: 'flight' });
  }

  incrementOverbookings(): void {
    this.errorRate.inc({ type: 'overbooking', operation: 'booking' });
  }

  createLegGenerationTimer() {
    return this.httpRequestDuration.startTimer({
      method: 'POST',
      route: '/ops/generate-legs',
    });
  }
}
