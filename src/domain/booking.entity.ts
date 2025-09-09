export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class Booking {
  constructor(
    public readonly id: number,
    public readonly user_id: string,
    public readonly itinerary_id: number,
    public status: BookingStatus,
    public readonly created_at: Date,
    public version: number,
  ) {}
}
