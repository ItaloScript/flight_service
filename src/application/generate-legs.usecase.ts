import { Injectable } from '@nestjs/common';
import { FlightRepository } from '../domain/ports/flight.repository';
import { LegRepository } from '../domain/ports/leg.repository';
import { AirportRepository } from '../domain/ports/airport.repository';
import { Leg } from '../domain/leg.entity';
import { Flight } from '../domain/flight.entity';
import { Airport } from '../domain/airport.entity';

@Injectable()
export class GenerateLegsUseCase {
  constructor(
    private readonly flightRepo: FlightRepository,
    private readonly legRepo: LegRepository,
    private readonly airportRepo: AirportRepository,
  ) {}

  async execute(startDate: string, endDate: string): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error('Data inicial deve ser anterior à data final');
    }

    // Buscar todos os flights ativos
    const flights = await this.flightRepo.findMany({});

    let generatedCount = 0;

    for (const flight of flights) {
      const legsGenerated = await this.generateLegsForFlight(
        flight,
        start,
        end,
      );
      generatedCount += legsGenerated;
    }

    return generatedCount;
  }

  private async generateLegsForFlight(
    flight: Flight,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Buscar informações dos aeroportos para timezone
    const originAirport = await this.airportRepo.findByIataCode(
      flight.origin_iata,
    );
    const destinationAirport = await this.airportRepo.findByIataCode(
      flight.destination_iata,
    );

    if (!originAirport || !destinationAirport) {
      console.warn(
        `Aeroportos não encontrados para flight ${flight.flight_number}`,
      );
      return 0;
    }

    let generatedCount = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Verificar se o flight opera no dia da semana atual
      if (flight.frequency.includes(dayOfWeek)) {
        // Verificar se já existe leg para esta data
        const existingLeg = await this.legRepo.findByFlightAndDate(
          flight.id,
          this.formatDate(currentDate),
        );

        if (!existingLeg) {
          const leg = await this.createLegForDate(
            flight,
            currentDate,
            originAirport,
            destinationAirport,
          );

          if (leg) {
            generatedCount++;
          }
        }
      }

      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return generatedCount;
  }

  private async createLegForDate(
    flight: Flight,
    serviceDate: Date,
    originAirport: Airport,
    destinationAirport: Airport,
  ): Promise<Leg | null> {
    try {
      // Converter horários locais para UTC considerando timezone dos aeroportos
      const departureUTC = this.convertLocalTimeToUTC(
        serviceDate,
        flight.departure_time_local,
        originAirport.timezone,
      );

      const arrivalUTC = this.convertLocalTimeToUTC(
        serviceDate,
        flight.arrival_time_local,
        destinationAirport.timezone,
      );

      // Se o horário de chegada for antes da partida, assume que é no dia seguinte
      if (arrivalUTC < departureUTC) {
        arrivalUTC.setDate(arrivalUTC.getDate() + 1);
      }

      const leg = new Leg(
        0,
        flight.id,
        this.formatDate(serviceDate),
        departureUTC.toISOString(),
        arrivalUTC.toISOString(),
        120, // capacidade padrão
        120, // assentos disponíveis (inicial = capacidade)
      );

      return await this.legRepo.create(leg);
    } catch (error) {
      const serviceDateStr = this.formatDate(serviceDate);
      console.error(
        `Erro ao criar leg para flight ${flight.flight_number} em ${serviceDateStr}:`,
        error,
      );
      return null;
    }
  }

  private convertLocalTimeToUTC(
    serviceDate: Date,
    localTime: string,
    timezone: string,
  ): Date {
    // Parse do horário local (formato HH:MM)
    const [hours, minutes] = localTime.split(':').map(Number);

    // Criar data/hora local
    const localDateTime = new Date(serviceDate);
    localDateTime.setHours(hours, minutes, 0, 0);

    // Converter timezone offset (formato +03:00 ou -05:00)
    const timezoneMatch = timezone.match(/([+-])(\d{2}):(\d{2})/);
    if (!timezoneMatch) {
      console.warn(`Timezone inválido: ${timezone}, usando UTC`);
      return localDateTime;
    }

    const sign = timezoneMatch[1] === '+' ? 1 : -1;
    const offsetHours = parseInt(timezoneMatch[2]);
    const offsetMinutes = parseInt(timezoneMatch[3]);
    const totalOffsetMinutes = sign * (offsetHours * 60 + offsetMinutes);

    // Converter para UTC
    const utcDateTime = new Date(
      localDateTime.getTime() - totalOffsetMinutes * 60 * 1000,
    );

    return utcDateTime;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
