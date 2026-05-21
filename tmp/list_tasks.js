const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('--- desarrollo_actividades ---');
    const dev = await prisma.desarrollo_actividades.findMany({ select: { id: true, titulo: true, estado: true, area_id: true, creador_id: true } });
    console.log(JSON.stringify(dev, null, 2));

    console.log('\n--- estrategia_actividades ---');
    const est = await prisma.estrategia_actividades.findMany({ select: { id: true, titulo: true, estado: true, area_id: true, creador_id: true } });
    console.log(JSON.stringify(est, null, 2));

    console.log('\n--- analisis_tareas ---');
    const ana = await prisma.analisis_tareas.findMany({ select: { id: true, titulo: true, estado: true, area_id: true, creador_id: true } });
    console.log(JSON.stringify(ana, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
