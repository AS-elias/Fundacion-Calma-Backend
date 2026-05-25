const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function cleanupEvaluaciones() {
  try {
    // Ver qué hay en director_evaluaciones
    const evaluaciones = await prisma.$queryRaw`
      SELECT * FROM core.director_evaluaciones;
    `;
    
    console.log('Evaluaciones actuales:');
    console.log(evaluaciones);

    // Limpiar si hay datos con director_id nulo o inválido
    const deleted = await prisma.$queryRaw`
      DELETE FROM core.director_evaluaciones 
      WHERE director_id IS NULL 
        OR director_id NOT IN (SELECT id FROM core.usuarios);
    `;
    
    console.log('\nRegistros eliminados:', deleted);

    console.log('\nEvaluaciones después de limpieza:');
    const evaluacionesAfter = await prisma.$queryRaw`
      SELECT * FROM core.director_evaluaciones;
    `;
    console.log(evaluacionesAfter);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupEvaluaciones();
