import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  SearchAvailabilityUseCase,
  SearchAvailabilityParams,
} from '../../application/search-availability.usecase';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly searchAvailability: SearchAvailabilityUseCase) {}

  @ApiOperation({ summary: 'Buscar disponibilidade de voos' })
  @ApiBody({
    description: 'Parâmetros de busca',
    schema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          example: 'BSB',
          description: 'Aeroporto de origem',
        },
        destination: {
          type: 'string',
          example: 'GIG',
          description: 'Aeroporto de destino',
        },
        departure_date: {
          type: 'string',
          example: '2025-07-01',
          description: 'Data de partida (YYYY-MM-DD)',
        },
        return_date: {
          type: 'string',
          example: '2025-07-10',
          description: 'Data de retorno (opcional)',
        },
        airlines: {
          type: 'array',
          items: { type: 'string' },
          example: ['LA', 'AZ'],
          description: 'Códigos das companhias preferidas',
        },
        max_stops: {
          type: 'number',
          example: 1,
          description: 'Máximo de conexões',
        },
        exclude_red_eye: {
          type: 'boolean',
          example: true,
          description: 'Excluir voos red-eye (00:00-05:00)',
        },
        max_total_duration_minutes: {
          type: 'number',
          example: 600,
          description: 'Duração máxima total em minutos',
        },
      },
      required: ['origin', 'destination', 'departure_date'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerários disponíveis encontrados',
  })
  @Post('search')
  async search(@Body() body: SearchAvailabilityParams): Promise<any[]> {
    return this.searchAvailability.execute(body);
  }
}
