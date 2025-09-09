import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../domain/ports/booking.repository';
import { ItineraryRepository } from '../domain/ports/itinerary.repository';
import { LegRepository } from '../domain/ports/leg.repository';
import { BookingStatus } from '../domain/booking.entity';

@Injectable()
export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly itineraryRepo: ItineraryRepository,
    private readonly legRepo: LegRepository,
  ) {}

  async execute(bookingId: number): Promise<void> {
    // 1. Buscar a reserva
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return; // Já cancelada
    }

    // 2. Buscar o itinerário
    const itinerary = await this.itineraryRepo.findById(booking.itinerary_id);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // 3. Liberar assentos em todos os legs
    for (const legId of itinerary.leg_ids) {
      try {
        await this.legRepo.incrementSeats(legId, 1);
      } catch (error) {
        console.error(`Failed to increment seats for leg ${legId}:`, error);
        // Continua com outros legs mesmo se um falhar
      }
    }

    // 4. Atualizar status da reserva
    booking.status = BookingStatus.CANCELLED;
    booking.version += 1;

    await this.bookingRepo.update(booking);
  }
}
