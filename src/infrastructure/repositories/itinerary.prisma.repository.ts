import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItineraryRepository } from '../../domain/ports/itinerary.repository';
import { Itinerary } from '../../domain/itinerary.entity';

@Injectable()
export class ItineraryPrismaRepository implements ItineraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Itinerary | null> {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: { legs: true },
    });
    if (!itinerary) return null;
    return new Itinerary(
      itinerary.id,
      itinerary.legs.map((l) => l.legId),
    );
  }

  async findMany(): Promise<Itinerary[]> {
    const itineraries = await this.prisma.itinerary.findMany({
      include: { legs: true },
    });
    return itineraries.map(
      (i) =>
        new Itinerary(
          i.id,
          i.legs.map((l) => l.legId),
        ),
    );
  }

  async create(itinerary: Itinerary): Promise<Itinerary> {
    const created = await this.prisma.itinerary.create({
      data: {
        legs: {
          create: itinerary.leg_ids.map((legId) => ({
            leg: { connect: { id: legId } },
          })),
        },
      },
      include: { legs: true },
    });
    return new Itinerary(
      created.id,
      created.legs.map((l) => l.legId),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.itinerary.delete({ where: { id } });
  }
}
