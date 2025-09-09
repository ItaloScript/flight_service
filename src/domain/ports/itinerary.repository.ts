import { Itinerary } from '../itinerary.entity';

export interface ItineraryRepository {
  findById(id: number): Promise<Itinerary | null>;
  findMany(): Promise<Itinerary[]>;
  create(itinerary: Itinerary): Promise<Itinerary>;
  delete(id: number): Promise<void>;
}
