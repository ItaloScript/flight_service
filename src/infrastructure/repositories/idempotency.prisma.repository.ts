import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdempotencyStore } from '../../domain/ports/idempotency.store';

@Injectable()
export class IdempotencyPrismaRepository implements IdempotencyStore {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<any> {
    const record = await this.prisma.idempotencyKey.findUnique({
      where: { key },
    });
    return record ? record.value : null;
  }

  async set(key: string, value: any): Promise<void> {
    await this.prisma.idempotencyKey.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
