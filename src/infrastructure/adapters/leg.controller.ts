import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { LegPrismaRepository } from '../repositories/leg.prisma.repository';
import { GenerateLegsUseCase } from '../../application/generate-legs.usecase';
import { Leg } from '../../domain/leg.entity';

@ApiTags('legs')
@Controller('legs')
export class LegController {
  constructor(private readonly legRepo: LegPrismaRepository) {}

  @ApiOperation({ summary: 'Buscar legs (instâncias datadas de voos)' })
  @ApiQuery({
    name: 'origin',
    required: false,
    description: 'Aeroporto de origem',
  })
  @ApiQuery({
    name: 'destination',
    required: false,
    description: 'Aeroporto de destino',
  })
  @ApiQuery({
    name: 'service_date',
    required: false,
    description: 'Data do serviço (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Lista de legs encontrados' })
  @Get()
  async findMany(
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('service_date') service_date?: string,
  ): Promise<Leg[]> {
    return this.legRepo.findMany({ origin, destination, service_date });
  }
}

@ApiTags('ops')
@Controller('ops')
export class OpsController {
  constructor(private readonly generateLegsUseCase: GenerateLegsUseCase) {}

  @ApiOperation({ summary: 'Gerar legs para um intervalo de datas' })
  @ApiBody({
    description: 'Intervalo de datas para geração de legs',
    schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          example: '2025-09-10',
          description: 'Data inicial (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          example: '2025-09-30',
          description: 'Data final (YYYY-MM-DD)',
        },
      },
      required: ['start_date', 'end_date'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Legs gerados com sucesso',
    schema: {
      type: 'object',
      properties: {
        generated: { type: 'number', example: 42 },
        message: { type: 'string', example: 'Legs gerados com sucesso' },
      },
    },
  })
  @Post('generate-legs')
  async generateLegs(
    @Body() body: { start_date: string; end_date: string },
  ): Promise<{ generated: number; message: string }> {
    try {
      const generated = await this.generateLegsUseCase.execute(
        body.start_date,
        body.end_date,
      );
      return {
        generated,
        message: `${generated} legs gerados com sucesso para o período ${body.start_date} a ${body.end_date}`,
      };
    } catch (error: any) {
      throw new Error(
        `Erro ao gerar legs: ${error?.message || 'unknown error'}`,
      );
    }
  }
}
