import { Flight } from '../flight.entity';

export interface FlightRepository {
  findById(id: number): Promise<Flight | null>;
  findMany(params: {
    airline_code?: string;
    origin?: string;
    destination?: string;
  }): Promise<Flight[]>;
  create(flight: Flight): Promise<Flight>;
  update(flight: Flight): Promise<Flight>;
  delete(id: number): Promise<void>;
}
