import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ItineraryPrismaRepository } from '../repositories/itinerary.prisma.repository';
import { Itinerary } from '../../domain/itinerary.entity';

@ApiTags('itineraries')
@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryRepo: ItineraryPrismaRepository) {}

  @ApiOperation({ summary: 'Listar todos os itinerários' })
  @ApiResponse({ status: 200, description: 'Lista de itinerários' })
  @Get()
  async findMany(): Promise<Itinerary[]> {
    return this.itineraryRepo.findMany();
  }

  @ApiOperation({ summary: 'Buscar itinerário por ID' })
  @ApiParam({ name: 'id', description: 'ID do itinerário' })
  @ApiResponse({ status: 200, description: 'Itinerário encontrado' })
  @ApiResponse({ status: 404, description: 'Itinerário não encontrado' })
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Itinerary | null> {
    return this.itineraryRepo.findById(Number(id));
  }

  @ApiOperation({ summary: 'Criar novo itinerário' })
  @ApiBody({
    description: 'IDs dos legs que compõem o itinerário',
    schema: {
      type: 'object',
      properties: {
        leg_ids: {
          type: 'array',
          items: { type: 'number' },
          example: [1010, 1025],
        },
      },
      required: ['leg_ids'],
    },
  })
  @ApiResponse({ status: 201, description: 'Itinerário criado com sucesso' })
  @Post()
  async create(@Body() body: { leg_ids: number[] }): Promise<Itinerary> {
    const itinerary = new Itinerary(0, body.leg_ids);
    return this.itineraryRepo.create(itinerary);
  }

  @ApiOperation({ summary: 'Deletar itinerário' })
  @ApiParam({ name: 'id', description: 'ID do itinerário' })
  @ApiResponse({ status: 200, description: 'Itinerário deletado com sucesso' })
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.itineraryRepo.delete(Number(id));
  }
}
