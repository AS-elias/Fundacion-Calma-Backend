const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const p = await prisma.permisos_area.findMany({ where: { usuario_id: 25 } });
    console.log('Permisos User 25:', p);
    const areas = await prisma.areas.findMany();
    console.log('Areas:', areas);
}
main().finally(() => prisma.$disconnect());
