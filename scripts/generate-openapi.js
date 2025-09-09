const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');
const path = require('path');

async function generateOpenAPI() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Flight Service API')
    .setDescription('Serviço de gerenciamento de voos - Teste Técnico Senior Backend Engineer')
    .setVersion('1.0')
    .addTag('flights', 'Operações de voos')
    .addTag('airlines', 'Operações de companhias aéreas')
    .addTag('airports', 'Operações de aeroportos')
    .addTag('availability', 'Busca de disponibilidade de voos')
    .addTag('bookings', 'Operações de reservas')
    .addTag('itineraries', 'Operações de itinerários')
    .addTag('legs', 'Operações de legs (instâncias de voos)')
    .addTag('ops', 'Operações administrativas')
    .addTag('health', 'Verificação de saúde')
    .addTag('metrics', 'Métricas do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Garante que o diretório dist existe
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Salva a especificação OpenAPI como JSON
  const outputPath = path.join(distDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`Especificação OpenAPI gerada em: ${outputPath}`);

  await app.close();
}

generateOpenAPI().catch(console.error);
