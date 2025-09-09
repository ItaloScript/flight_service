import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Headers,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { BookingPrismaRepository } from '../repositories/booking.prisma.repository';
import { CreateBookingUseCase } from '../../application/create-booking.usecase';
import { CancelBookingUseCase } from '../../application/cancel-booking.usecase';
import { Booking } from '../../domain/booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingRepo: BookingPrismaRepository,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar nova reserva (idempotente)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'UUID único para garantir idempotência',
    required: true,
  })
  @ApiBody({
    description: 'Dados da reserva',
    schema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          example: 'user-abc-123',
          description: 'ID do usuário',
        },
        itinerary_id: {
          type: 'number',
          example: 101,
          description: 'ID do itinerário',
        },
      },
      required: ['user_id', 'itinerary_id'],
    },
  })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso' })
  @ApiResponse({
    status: 409,
    description:
      'Conflito - Idempotency-Key obrigatório ou assentos indisponíveis',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'SEAT_UNAVAILABLE' },
            message: {
              type: 'string',
              example: 'No seats available for one or more legs.',
            },
            trace_id: { type: 'string', example: 'trace_1234567890_abc123' },
          },
        },
      },
    },
  })
  @Post()
  async create(
    @Body() body: { user_id: string; itinerary_id: number },
    @Headers('Idempotency-Key') idempotencyKey: string,
  ): Promise<Booking> {
    if (!idempotencyKey) {
      throw new ConflictException('Idempotency-Key required');
    }

    return this.createBookingUseCase.execute({
      user_id: body.user_id,
      itinerary_id: body.itinerary_id,
      idempotency_key: idempotencyKey,
    });
  }

  @ApiOperation({ summary: 'Cancelar reserva' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  @Delete(':id')
  async cancel(@Param('id') id: number): Promise<{ message: string }> {
    await this.cancelBookingUseCase.execute(Number(id));
    return { message: 'Booking cancelled successfully' };
  }
}

@ApiTags('users')
@Controller('users')
export class UserBookingController {
  constructor(private readonly bookingRepo: BookingPrismaRepository) {}

  @ApiOperation({ summary: 'Buscar reservas do usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de reservas do usuário' })
  @Get(':userId/bookings')
  async findByUser(@Param('userId') userId: string): Promise<Booking[]> {
    return this.bookingRepo.findByUserId(userId);
  }
}
