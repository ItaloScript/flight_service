import { Airline } from '../airline.entity';

export interface AirlineRepository {
  findById(id: number): Promise<Airline | null>;
  findByIataCode(iata: string): Promise<Airline | null>;
  create(airline: Airline): Promise<Airline>;
  update(airline: Airline): Promise<Airline>;
  delete(id: number): Promise<void>;
}
