const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const proy = await prisma.proyectos.findMany({ select: { id: true, titulo: true, tipo: true, estado: true, area_id: true, responsable_id: true } });
    console.log('--- proyectos ---');
    console.log(JSON.stringify(proy, null, 2));
    const count = await prisma.proyectos.count();
    console.log('proyectos count:', count);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
