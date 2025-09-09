import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar airlines
  await prisma.airline.upsert({
    where: { iata_code: 'LA' },
    update: {},
    create: {
      name: 'LATAM Airlines',
      iata_code: 'LA',
    },
  });

  await prisma.airline.upsert({
    where: { iata_code: 'AD' },
    update: {},
    create: {
      name: 'Azul Airlines',
      iata_code: 'AD',
    },
  });

  await prisma.airline.upsert({
    where: { iata_code: 'G3' },
    update: {},
    create: {
      name: 'Gol Airlines',
      iata_code: 'G3',
    },
  });

  // Criar airports
  await prisma.airport.upsert({
    where: { iata_code: 'BSB' },
    update: {},
    create: {
      name: 'Brasília International Airport',
      iata_code: 'BSB',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.airport.upsert({
    where: { iata_code: 'GIG' },
    update: {},
    create: {
      name: 'Rio de Janeiro International Airport',
      iata_code: 'GIG',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.airport.upsert({
    where: { iata_code: 'CGH' },
    update: {},
    create: {
      name: 'São Paulo Congonhas Airport',
      iata_code: 'CGH',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.airport.upsert({
    where: { iata_code: 'GRU' },
    update: {},
    create: {
      name: 'São Paulo Guarulhos International Airport',
      iata_code: 'GRU',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.airport.upsert({
    where: { iata_code: 'VCP' },
    update: {},
    create: {
      name: 'Campinas Viracopos International Airport',
      iata_code: 'VCP',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.airport.upsert({
    where: { iata_code: 'IMP' },
    update: {},
    create: {
      name: 'Imperatriz Airport',
      iata_code: 'IMP',
      timezone: 'America/Sao_Paulo',
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {});
    return;
  });
