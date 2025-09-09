import { Booking } from '../booking.entity';

export interface BookingRepository {
  findById(id: number): Promise<Booking | null>;
  findByUserId(userId: string): Promise<Booking[]>;
  create(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  delete(id: number): Promise<void>;
}
