import { Leg } from '../leg.entity';

export interface LegRepository {
  findById(id: number): Promise<Leg | null>;
  findMany(params: {
    origin?: string;
    destination?: string;
    service_date?: string;
  }): Promise<Leg[]>;
  findByFlightAndDate(
    flightId: number,
    serviceDate: string,
  ): Promise<Leg | null>;
  create(leg: Leg): Promise<Leg>;
  update(leg: Leg): Promise<Leg>;
  delete(id: number): Promise<void>;

  // Métodos para controle de concorrência
  decrementSeats(
    legId: number,
    currentVersion: number,
    seats: number,
  ): Promise<boolean>;
  incrementSeats(legId: number, seats: number): Promise<void>;
  findByIds(ids: number[]): Promise<Leg[]>;
}
