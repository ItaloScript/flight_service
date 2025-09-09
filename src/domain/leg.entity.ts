export class Leg {
  constructor(
    public readonly id: number,
    public readonly flight_id: number,
    public readonly service_date: string, // YYYY-MM-DD
    public readonly departure_datetime_utc: string, // ISO
    public readonly arrival_datetime_utc: string, // ISO
    public readonly capacity_total: number,
    public seats_available: number,
    public version: number = 1,
  ) {}

  /**
   * Verifica se há assentos disponíveis
   */
  hasAvailableSeats(requestedSeats: number = 1): boolean {
    return this.seats_available >= requestedSeats;
  }

  /**
   * Decrementa assentos disponíveis (para uso em lógica de domínio)
   */
  decrementSeats(seats: number = 1): void {
    if (!this.hasAvailableSeats(seats)) {
      throw new Error(
        `Insufficient seats available. Requested: ${seats}, Available: ${this.seats_available}`,
      );
    }
    this.seats_available -= seats;
    this.version += 1;
  }

  /**
   * Incrementa assentos disponíveis (para cancelamentos)
   */
  incrementSeats(seats: number = 1): void {
    this.seats_available += seats;
    this.version += 1;
  }
}
