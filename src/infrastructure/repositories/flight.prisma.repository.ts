import { Injectable } from '@nestjs/common';
import { FlightRepository } from '../../domain/ports/flight.repository';
import { Flight } from '../../domain/flight.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlightPrismaRepository implements FlightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Flight | null> {
    const flight = await this.prisma.flight.findUnique({ where: { id } });
    if (!flight) return null;
    return new Flight(
      flight.id,
      flight.flight_number,
      flight.airline_id,
      flight.origin_iata,
      flight.destination_iata,
      flight.departure_time_local,
      flight.arrival_time_local,
      flight.frequency,
    );
  }

  async findMany(params: {
    airline_code?: string;
    origin?: string;
    destination?: string;
  }): Promise<Flight[]> {
    const flights = await this.prisma.flight.findMany({
      where: {
        ...(params.airline_code && {
          airline: { iata_code: params.airline_code },
        }),
        ...(params.origin && { origin_iata: params.origin }),
        ...(params.destination && { destination_iata: params.destination }),
      },
      include: { airline: true },
    });
    return flights.map(
      (f) =>
        new Flight(
          f.id,
          f.flight_number,
          f.airline_id,
          f.origin_iata,
          f.destination_iata,
          f.departure_time_local,
          f.arrival_time_local,
          f.frequency,
        ),
    );
  }

  async create(flight: Flight): Promise<Flight> {
    // Verificar se a airline existe
    const airline = await this.prisma.airline.findUnique({
      where: { id: flight.airline_id },
    });
    if (!airline) {
      throw new Error(`Airline with id ${flight.airline_id} not found`);
    }

    // Verificar se os aeroportos existem
    const originAirport = await this.prisma.airport.findUnique({
      where: { iata_code: flight.origin_iata },
    });
    if (!originAirport) {
      throw new Error(
        `Origin airport with IATA code ${flight.origin_iata} not found`,
      );
    }

    const destinationAirport = await this.prisma.airport.findUnique({
      where: { iata_code: flight.destination_iata },
    });
    if (!destinationAirport) {
      throw new Error(
        `Destination airport with IATA code ${flight.destination_iata} not found`,
      );
    }

    const created = await this.prisma.flight.create({
      data: {
        flight_number: flight.flight_number,
        airline_id: flight.airline_id,
        origin_iata: flight.origin_iata,
        destination_iata: flight.destination_iata,
        departure_time_local: flight.departure_time_local,
        arrival_time_local: flight.arrival_time_local,
        frequency: flight.frequency,
      },
    });
    return new Flight(
      created.id,
      created.flight_number,
      created.airline_id,
      created.origin_iata,
      created.destination_iata,
      created.departure_time_local,
      created.arrival_time_local,
      created.frequency,
    );
  }

  async update(flight: Flight): Promise<Flight> {
    const updated = await this.prisma.flight.update({
      where: { id: flight.id },
      data: {
        flight_number: flight.flight_number,
        airline_id: flight.airline_id,
        origin_iata: flight.origin_iata,
        destination_iata: flight.destination_iata,
        departure_time_local: flight.departure_time_local,
        arrival_time_local: flight.arrival_time_local,
        frequency: flight.frequency,
      },
    });
    return new Flight(
      updated.id,
      updated.flight_number,
      updated.airline_id,
      updated.origin_iata,
      updated.destination_iata,
      updated.departure_time_local,
      updated.arrival_time_local,
      updated.frequency,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.flight.delete({ where: { id } });
  }
}
