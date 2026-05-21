const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function cleanAll() {
  try {
    // Eliminar todos los registros de director_evaluaciones
    const result = await prisma.$executeRaw`TRUNCATE TABLE core.director_evaluaciones CASCADE;`;
    console.log('✓ Tabla director_evaluaciones limpiada');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAll();
