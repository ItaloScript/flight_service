import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from '../domain/ports/booking.repository';
import { ItineraryRepository } from '../domain/ports/itinerary.repository';
import { LegRepository } from '../domain/ports/leg.repository';
import { IdempotencyStore } from '../domain/ports/idempotency.store';
import { Booking, BookingStatus } from '../domain/booking.entity';

export interface CreateBookingParams {
  user_id: string;
  itinerary_id: number;
  idempotency_key: string;
}

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly itineraryRepo: ItineraryRepository,
    private readonly legRepo: LegRepository,
    private readonly idempotencyStore: IdempotencyStore,
  ) {}

  async execute(params: CreateBookingParams): Promise<Booking> {
    // 1. Verificar idempotência
    const existingBooking = await this.idempotencyStore.get(
      params.idempotency_key,
    );
    if (existingBooking) {
      return existingBooking;
    }

    // 2. Buscar itinerário
    const itinerary = await this.itineraryRepo.findById(params.itinerary_id);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // 3. Buscar todos os legs do itinerário
    const legs = await this.legRepo.findByIds(itinerary.leg_ids);
    if (legs.length !== itinerary.leg_ids.length) {
      throw new NotFoundException('Some legs not found');
    }

    // 4. Verificar disponibilidade de assentos em todos os legs
    for (const leg of legs) {
      if (!leg.hasAvailableSeats(1)) {
        throw new ConflictException({
          code: 'SEAT_UNAVAILABLE',
          message: `No seats available for leg ${leg.id}`,
          trace_id: this.generateTraceId(),
        });
      }
    }

    // 5. Tentar decrementar assentos em todos os legs (locking otimista)
    const decrementResults: boolean[] = [];

    for (const leg of legs) {
      const success = await this.legRepo.decrementSeats(leg.id, leg.version, 1);
      decrementResults.push(success);

      if (!success) {
        // Rollback - incrementar assentos nos legs que já foram decrementados
        await this.rollbackSeatDecrements(
          legs.slice(0, decrementResults.length - 1),
        );

        throw new ConflictException({
          code: 'SEAT_UNAVAILABLE',
          message: 'No seats available for one or more legs.',
          trace_id: this.generateTraceId(),
        });
      }
    }

    // 6. Criar a reserva
    const booking = new Booking(
      0, // id será gerado pelo banco
      params.user_id,
      params.itinerary_id,
      BookingStatus.CONFIRMED,
      new Date(),
      1,
    );

    try {
      const createdBooking = await this.bookingRepo.create(booking);

      // 7. Salvar na cache de idempotência
      await this.idempotencyStore.set(params.idempotency_key, createdBooking);

      return createdBooking;
    } catch (error) {
      // Rollback em caso de erro na criação da reserva
      await this.rollbackSeatDecrements(legs);
      throw error;
    }
  }

  private async rollbackSeatDecrements(legs: any[]): Promise<void> {
    for (const leg of legs) {
      try {
        await this.legRepo.incrementSeats(leg.id, 1);
      } catch (error) {
        console.error(
          `Failed to rollback seat increment for leg ${leg.id}:`,
          error,
        );
      }
    }
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
