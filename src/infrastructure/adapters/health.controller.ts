import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @ApiOperation({
    summary: 'Verificação de saúde da aplicação',
    description: 'Endpoint para monitoramento básico de saúde do serviço',
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço funcionando normalmente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @Get()
  liveness() {
    return { status: 'ok' };
  }
}
