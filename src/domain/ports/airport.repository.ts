import { Airport } from '../airport.entity';

export interface AirportRepository {
  findById(id: number): Promise<Airport | null>;
  findByIataCode(iata: string): Promise<Airport | null>;
  create(airport: Airport): Promise<Airport>;
  update(airport: Airport): Promise<Airport>;
  delete(id: number): Promise<void>;
}
