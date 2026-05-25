const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const areas = await prisma.areas.findMany({ select: { id: true, nombre: true } });
  console.log(JSON.stringify(areas, null, 2));
}
main().finally(() => prisma.$disconnect());
