import { LegRepository } from '../domain/ports/leg.repository';
import { ItineraryRepository } from '../domain/ports/itinerary.repository';

export interface SearchAvailabilityParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  airlines?: string[];
  max_stops?: number;
  exclude_red_eye?: boolean;
  max_total_duration_minutes?: number;
}

export class SearchAvailabilityUseCase {
  constructor(
    private readonly legRepo: LegRepository,
    private readonly itineraryRepo: ItineraryRepository,
  ) {}

  async execute(params: SearchAvailabilityParams) {
    // Busca itinerários existentes
    const itineraries = await this.itineraryRepo.findMany();

    console.log(JSON.stringify(itineraries, null, 2));

    // Busca todos os legs necessários para filtros, incluindo dados do Flight
    const allLegs = await Promise.all(
      itineraries.map(async (it) => {
        const legs = await Promise.all(
          it.leg_ids.map(async (legId) => {
            const leg = await this.legRepo.findById(legId);
            if (!leg) return null;
            // Busca dados do Flight para o leg
            const flight = leg.flight_id
              ? await this.legRepo['prisma'].flight.findUnique({
                  where: { id: leg.flight_id },
                })
              : null;
            return {
              ...leg,
              origin_iata: flight?.origin_iata,
              destination_iata: flight?.destination_iata,
              airline_code: flight?.airline_id, // ou buscar Airline se necessário
              departure_time_local: flight?.departure_time_local,
              arrival_time_local: flight?.arrival_time_local,
            };
          }),
        );

        console.log({ it, legs });
        return { itinerary: it, legs: legs.filter(Boolean) };
      }),
    );

    // Filtros de origem/destino, data, cias, red-eye, duração, conexões
    const filtered = allLegs.filter(({ legs }) => {
      if (!legs.length) return false;
      const firstLeg = legs[0];
      const lastLeg = legs[legs.length - 1];
      if (!firstLeg || !lastLeg) return false;

      // Origem/destino
      if (!firstLeg.origin_iata || firstLeg.origin_iata !== params.origin)
        return false;
      if (
        !lastLeg.destination_iata ||
        lastLeg.destination_iata !== params.destination
      )
        return false;

      // Data de partida
      if (
        !firstLeg.service_date ||
        firstLeg.service_date !== params.departure_date
      )
        return false;

      // Cias
      if (params.airlines && params.airlines.length > 0) {
        const hasPreferred = legs.some(
          (leg: any) =>
            leg.airline_code &&
            params.airlines!.includes(leg.airline_code.toString()),
        );
        if (!hasPreferred) return false;
      }

      // Red-eye
      if (params.exclude_red_eye) {
        if (!firstLeg.departure_time_local) return false;
        const hour = Number(firstLeg.departure_time_local.split(':')[0]);
        if (hour >= 0 && hour < 5) return false;
      }

      // Conexões
      if (params.max_stops !== undefined && legs.length - 1 > params.max_stops)
        return false;
      // Duração total
      if (params.max_total_duration_minutes !== undefined) {
        if (!lastLeg.arrival_datetime_utc || !firstLeg.departure_datetime_utc)
          return false;
        const duration =
          (new Date(lastLeg.arrival_datetime_utc).getTime() -
            new Date(firstLeg.departure_datetime_utc).getTime()) /
          60000;
        if (duration > params.max_total_duration_minutes) return false;
      }
      return true;
    });

    console.log({
      filtered,
    });

    // Monta resposta ordenada
    const result = filtered.map(({ itinerary, legs }) => {
      const firstLeg = legs[0];
      const lastLeg = legs[legs.length - 1];
      let duration = 0;
      if (lastLeg?.arrival_datetime_utc && firstLeg?.departure_datetime_utc) {
        duration =
          (new Date(lastLeg.arrival_datetime_utc).getTime() -
            new Date(firstLeg.departure_datetime_utc).getTime()) /
          60000;
      }
      return {
        itinerary_id: itinerary.id,
        legs,
        total_duration: duration,
        stops: legs.length - 1,
      };
    });

    // Ordenação por menor duração, depois menor número de conexões
    result.sort((a, b) => {
      if (a.total_duration !== b.total_duration) {
        return a.total_duration - b.total_duration;
      }
      return a.stops - b.stops;
    });

    console.log({ result });

    return result;
  }
}
