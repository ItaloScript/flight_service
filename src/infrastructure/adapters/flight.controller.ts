import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FlightPrismaRepository } from '../repositories/flight.prisma.repository';
import { Flight } from '../../domain/flight.entity';

@ApiTags('flights')
@Controller('flights')
export class FlightController {
  constructor(private readonly flightRepo: FlightPrismaRepository) {}

  @ApiOperation({ summary: 'Buscar voos' })
  @ApiQuery({
    name: 'airline_code',
    required: false,
    description: 'Código IATA da companhia aérea',
  })
  @ApiQuery({
    name: 'origin',
    required: false,
    description: 'Aeroporto de origem (código IATA)',
  })
  @ApiQuery({
    name: 'destination',
    required: false,
    description: 'Aeroporto de destino (código IATA)',
  })
  @ApiResponse({ status: 200, description: 'Lista de voos encontrados' })
  @Get()
  async findMany(
    @Query('airline_code') airline_code?: string,
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
  ): Promise<Flight[]> {
    return this.flightRepo.findMany({ airline_code, origin, destination });
  }

  @ApiOperation({ summary: 'Buscar voo por ID' })
  @ApiParam({ name: 'id', description: 'ID do voo' })
  @ApiResponse({ status: 200, description: 'Voo encontrado' })
  @ApiResponse({ status: 404, description: 'Voo não encontrado' })
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Flight | null> {
    return this.flightRepo.findById(Number(id));
  }

  @ApiOperation({ summary: 'Criar novo voo' })
  @ApiBody({
    description: 'Dados do voo',
    schema: {
      type: 'object',
      properties: {
        flight_number: { type: 'string', example: 'AD4050' },
        airline_id: { type: 'number', example: 1 },
        origin_iata: { type: 'string', example: 'VCP' },
        destination_iata: { type: 'string', example: 'IMP' },
        departure_time_local: { type: 'string', example: '22:00' },
        arrival_time_local: { type: 'string', example: '00:30' },
        frequency: {
          type: 'array',
          items: { type: 'number' },
          example: [0, 1, 2, 3, 4, 5, 6],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Voo criado com sucesso' })
  @Post()
  async create(@Body() body: any): Promise<Flight> {
    const flight = new Flight(
      0,
      body.flight_number,
      body.airline_id,
      body.origin_iata,
      body.destination_iata,
      body.departure_time_local,
      body.arrival_time_local,
      body.frequency,
    );
    return this.flightRepo.create(flight);
  }

  @ApiOperation({ summary: 'Atualizar voo' })
  @ApiParam({ name: 'id', description: 'ID do voo' })
  @ApiBody({ description: 'Dados atualizados do voo' })
  @ApiResponse({ status: 200, description: 'Voo atualizado com sucesso' })
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any): Promise<Flight> {
    const flight = new Flight(
      Number(id),
      body.flight_number,
      body.airline_id,
      body.origin_iata,
      body.destination_iata,
      body.departure_time_local,
      body.arrival_time_local,
      body.frequency,
    );
    return this.flightRepo.update(flight);
  }

  @ApiOperation({ summary: 'Deletar voo' })
  @ApiParam({ name: 'id', description: 'ID do voo' })
  @ApiResponse({ status: 200, description: 'Voo deletado com sucesso' })
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.flightRepo.delete(Number(id));
  }
}
