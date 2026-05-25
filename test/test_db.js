const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notis = await prisma.notificaciones.findMany({ take: 10 });
  console.log(JSON.stringify(notis, null, 2));
}
main().finally(() => prisma.$disconnect());
