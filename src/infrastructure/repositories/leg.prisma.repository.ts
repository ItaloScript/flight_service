import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LegRepository } from '../../domain/ports/leg.repository';
import { Leg } from '../../domain/leg.entity';

@Injectable()
export class LegPrismaRepository implements LegRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Leg | null> {
    const leg = await this.prisma.leg.findUnique({ where: { id } });
    if (!leg) return null;
    return new Leg(
      leg.id,
      leg.flight_id,
      leg.service_date.toISOString().slice(0, 10),
      leg.departure_datetime_utc.toISOString(),
      leg.arrival_datetime_utc.toISOString(),
      leg.capacity_total,
      leg.seats_available,
      leg.version,
    );
  }

  async findByIds(ids: number[]): Promise<Leg[]> {
    const legs = await this.prisma.leg.findMany({
      where: { id: { in: ids } },
    });
    return legs.map(
      (leg) =>
        new Leg(
          leg.id,
          leg.flight_id,
          leg.service_date.toISOString().slice(0, 10),
          leg.departure_datetime_utc.toISOString(),
          leg.arrival_datetime_utc.toISOString(),
          leg.capacity_total,
          leg.seats_available,
          leg.version,
        ),
    );
  }

  async findMany(params: {
    origin?: string;
    destination?: string;
    service_date?: string;
  }): Promise<Leg[]> {
    const legs = await this.prisma.leg.findMany({
      where: {
        ...(params.origin && { flight: { origin_iata: params.origin } }),
        ...(params.destination && {
          flight: { destination_iata: params.destination },
        }),
        ...(params.service_date && {
          service_date: new Date(params.service_date),
        }),
      },
      include: { flight: true },
    });
    return legs.map(
      (leg) =>
        new Leg(
          leg.id,
          leg.flight_id,
          leg.service_date.toISOString().slice(0, 10),
          leg.departure_datetime_utc.toISOString(),
          leg.arrival_datetime_utc.toISOString(),
          leg.capacity_total,
          leg.seats_available,
          leg.version,
        ),
    );
  }

  async findByFlightAndDate(
    flightId: number,
    serviceDate: string,
  ): Promise<Leg | null> {
    const leg = await this.prisma.leg.findFirst({
      where: {
        flight_id: flightId,
        service_date: new Date(serviceDate),
      },
    });
    if (!leg) return null;
    return new Leg(
      leg.id,
      leg.flight_id,
      leg.service_date.toISOString().slice(0, 10),
      leg.departure_datetime_utc.toISOString(),
      leg.arrival_datetime_utc.toISOString(),
      leg.capacity_total,
      leg.seats_available,
      leg.version,
    );
  }

  /**
   * Decrementa assentos disponíveis com locking otimista
   * Retorna true se a operação foi bem-sucedida, false se houve conflito
   */
  async decrementSeats(
    legId: number,
    currentVersion: number,
    seats: number = 1,
  ): Promise<boolean> {
    try {
      const result = await this.prisma.$executeRaw`
        UPDATE "Leg" 
        SET "seats_available" = "seats_available" - ${seats}, "version" = "version" + 1
        WHERE "id" = ${legId} 
          AND "seats_available" >= ${seats}
          AND "version" = ${currentVersion}
      `;

      return result > 0;
    } catch (error) {
      console.error('Error decrementing seats:', error);
      return false;
    }
  }

  /**
   * Incrementa assentos disponíveis (para cancelamentos)
   */
  async incrementSeats(legId: number, seats: number = 1): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "Leg" 
      SET "seats_available" = "seats_available" + ${seats}, "version" = "version" + 1
      WHERE "id" = ${legId}
    `;
  }

  async create(leg: Leg): Promise<Leg> {
    const created = await this.prisma.leg.create({
      data: {
        flight_id: leg.flight_id,
        service_date: new Date(leg.service_date),
        departure_datetime_utc: new Date(leg.departure_datetime_utc),
        arrival_datetime_utc: new Date(leg.arrival_datetime_utc),
        capacity_total: leg.capacity_total,
        seats_available: leg.seats_available,
        version: leg.version,
      },
    });
    return new Leg(
      created.id,
      created.flight_id,
      created.service_date.toISOString().slice(0, 10),
      created.departure_datetime_utc.toISOString(),
      created.arrival_datetime_utc.toISOString(),
      created.capacity_total,
      created.seats_available,
      created.version,
    );
  }

  async update(leg: Leg): Promise<Leg> {
    const updated = await this.prisma.leg.update({
      where: { id: leg.id },
      data: {
        flight_id: leg.flight_id,
        service_date: new Date(leg.service_date),
        departure_datetime_utc: new Date(leg.departure_datetime_utc),
        arrival_datetime_utc: new Date(leg.arrival_datetime_utc),
        capacity_total: leg.capacity_total,
        seats_available: leg.seats_available,
        version: leg.version,
      },
    });
    return new Leg(
      updated.id,
      updated.flight_id,
      updated.service_date.toISOString().slice(0, 10),
      updated.departure_datetime_utc.toISOString(),
      updated.arrival_datetime_utc.toISOString(),
      updated.capacity_total,
      updated.seats_available,
      updated.version,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.leg.delete({ where: { id } });
  }
}
