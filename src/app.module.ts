import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FlightController } from './infrastructure/adapters/flight.controller';
import {
  LegController,
  OpsController,
} from './infrastructure/adapters/leg.controller';
import { ItineraryController } from './infrastructure/adapters/itinerary.controller';
import { AvailabilityController } from './infrastructure/adapters/availability.controller';
import {
  BookingController,
  UserBookingController,
} from './infrastructure/adapters/booking.controller';
import { HealthController } from './infrastructure/adapters/health.controller';
import { MetricsController } from './infrastructure/adapters/metrics.controller';

import { FlightPrismaRepository } from './infrastructure/repositories/flight.prisma.repository';
import { LegPrismaRepository } from './infrastructure/repositories/leg.prisma.repository';
import { ItineraryPrismaRepository } from './infrastructure/repositories/itinerary.prisma.repository';
import { BookingPrismaRepository } from './infrastructure/repositories/booking.prisma.repository';
import { IdempotencyPrismaRepository } from './infrastructure/repositories/idempotency.prisma.repository';
import { AirportPrismaRepository } from './infrastructure/repositories/airport.prisma.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { MetricsService } from './infrastructure/metrics/metrics.service';
import { MetricsInterceptor } from './infrastructure/interceptors/metrics.interceptor';

import { SearchAvailabilityUseCase } from './application/search-availability.usecase';
import { GenerateLegsUseCase } from './application/generate-legs.usecase';
import { CreateBookingUseCase } from './application/create-booking.usecase';
import { CancelBookingUseCase } from './application/cancel-booking.usecase';

@Module({
  imports: [],
  controllers: [
    FlightController,
    LegController,
    OpsController,
    ItineraryController,
    AvailabilityController,
    BookingController,
    UserBookingController,
    HealthController,
    MetricsController,
  ],
  providers: [
    PrismaService,
    MetricsService,
    FlightPrismaRepository,
    LegPrismaRepository,
    ItineraryPrismaRepository,
    BookingPrismaRepository,
    IdempotencyPrismaRepository,
    AirportPrismaRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: SearchAvailabilityUseCase,
      useFactory: (
        legRepo: LegPrismaRepository,
        itineraryRepo: ItineraryPrismaRepository,
      ) => new SearchAvailabilityUseCase(legRepo, itineraryRepo),
      inject: [LegPrismaRepository, ItineraryPrismaRepository],
    },
    {
      provide: GenerateLegsUseCase,
      useFactory: (
        flightRepo: FlightPrismaRepository,
        legRepo: LegPrismaRepository,
        airportRepo: AirportPrismaRepository,
      ) => new GenerateLegsUseCase(flightRepo, legRepo, airportRepo),
      inject: [
        FlightPrismaRepository,
        LegPrismaRepository,
        AirportPrismaRepository,
      ],
    },
    {
      provide: CreateBookingUseCase,
      useFactory: (
        bookingRepo: BookingPrismaRepository,
        itineraryRepo: ItineraryPrismaRepository,
        legRepo: LegPrismaRepository,
        idempotencyStore: IdempotencyPrismaRepository,
      ) =>
        new CreateBookingUseCase(
          bookingRepo,
          itineraryRepo,
          legRepo,
          idempotencyStore,
        ),
      inject: [
        BookingPrismaRepository,
        ItineraryPrismaRepository,
        LegPrismaRepository,
        IdempotencyPrismaRepository,
      ],
    },
    {
      provide: CancelBookingUseCase,
      useFactory: (
        bookingRepo: BookingPrismaRepository,
        itineraryRepo: ItineraryPrismaRepository,
        legRepo: LegPrismaRepository,
      ) => new CancelBookingUseCase(bookingRepo, itineraryRepo, legRepo),
      inject: [
        BookingPrismaRepository,
        ItineraryPrismaRepository,
        LegPrismaRepository,
      ],
    },
  ],
})
export class AppModule {}
