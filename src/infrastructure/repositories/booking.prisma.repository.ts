import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingRepository } from '../../domain/ports/booking.repository';
import { Booking, BookingStatus } from '../../domain/booking.entity';

@Injectable()
export class BookingPrismaRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) return null;
    return new Booking(
      booking.id,
      booking.user_id,
      booking.itinerary_id,
      booking.status as BookingStatus,
      booking.created_at,
      booking.version,
    );
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { user_id: userId },
    });
    return bookings.map(
      (b) =>
        new Booking(
          b.id,
          b.user_id,
          b.itinerary_id,
          b.status as BookingStatus,
          b.created_at,
          b.version,
        ),
    );
  }

  async create(booking: Booking): Promise<Booking> {
    const created = await this.prisma.booking.create({
      data: {
        user_id: booking.user_id,
        itinerary_id: booking.itinerary_id,
        status: booking.status,
        version: booking.version,
      },
    });
    return new Booking(
      created.id,
      created.user_id,
      created.itinerary_id,
      created.status as BookingStatus,
      created.created_at,
      created.version,
    );
  }

  async update(booking: Booking): Promise<Booking> {
    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: booking.status,
        version: booking.version,
      },
    });
    return new Booking(
      updated.id,
      updated.user_id,
      updated.itinerary_id,
      updated.status as BookingStatus,
      updated.created_at,
      updated.version,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.booking.delete({ where: { id } });
  }
}
