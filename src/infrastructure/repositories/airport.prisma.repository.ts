import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AirportRepository } from '../../domain/ports/airport.repository';
import { Airport } from '../../domain/airport.entity';

@Injectable()
export class AirportPrismaRepository implements AirportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Airport | null> {
    const airport = await this.prisma.airport.findUnique({ where: { id } });
    if (!airport) return null;
    return new Airport(
      airport.id,
      airport.name,
      airport.iata_code,
      airport.timezone,
    );
  }

  async findByIataCode(iata: string): Promise<Airport | null> {
    const airport = await this.prisma.airport.findUnique({
      where: { iata_code: iata },
    });
    if (!airport) return null;
    return new Airport(
      airport.id,
      airport.name,
      airport.iata_code,
      airport.timezone,
    );
  }

  async create(airport: Airport): Promise<Airport> {
    const created = await this.prisma.airport.create({
      data: {
        name: airport.name,
        iata_code: airport.iata_code,
        timezone: airport.timezone,
      },
    });
    return new Airport(
      created.id,
      created.name,
      created.iata_code,
      created.timezone,
    );
  }

  async update(airport: Airport): Promise<Airport> {
    const updated = await this.prisma.airport.update({
      where: { id: airport.id },
      data: {
        name: airport.name,
        iata_code: airport.iata_code,
        timezone: airport.timezone,
      },
    });
    return new Airport(
      updated.id,
      updated.name,
      updated.iata_code,
      updated.timezone,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.airport.delete({ where: { id } });
  }
}
