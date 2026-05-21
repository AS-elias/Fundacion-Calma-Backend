const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const d = await prisma.desarrollo_actividades.count();
    const a = await prisma.analisis_tareas.count();
    const ea = await prisma.estrategia_actividades.count();
    const et = await prisma.estrategia_tareas.count();
    console.log({ desarrollo: d, analisis: a, estrategia_actividades: ea, estrategia_tareas: et });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
