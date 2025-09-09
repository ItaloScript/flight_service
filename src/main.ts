import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Flight Service API')
    .setDescription(
      'Serviço back-end para gestão de voos, itinerários e reservas',
    )
    .setVersion('1.0')
    .addTag('flights', 'Operações de voos')
    .addTag('legs', 'Instâncias datadas de voos')
    .addTag('itineraries', 'Itinerários de viagem')
    .addTag('availability', 'Busca de disponibilidade')
    .addTag('bookings', 'Reservas')
    .addTag('health', 'Monitoramento de saúde')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
