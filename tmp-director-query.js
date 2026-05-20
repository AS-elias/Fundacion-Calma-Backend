const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const roles = await prisma.$queryRaw`
      SELECT id, nombre FROM core.roles
      WHERE nombre ILIKE '%Director%'
      LIMIT 10
    `;
    console.log('roles:', roles);
    const users = await prisma.$queryRaw`
      SELECT u.id, u.nombre_completo, u.apellido_completo, r.nombre as rol
      FROM core.usuarios u
      LEFT JOIN core.roles r ON u.rol_id = r.id
      WHERE r.nombre ILIKE '%Director%'
      LIMIT 20
    `;
    console.log('users:', users);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
