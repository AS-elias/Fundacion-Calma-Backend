const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuarios.findMany({
    include: {
      roles: true,
      permisos_area: {
        include: { areas: true }
      }
    }
  });

  const updates = [];

  for (const user of users) {
    const isDirectorOrAdmin = ['Director', 'Administrador'].includes(user.roles?.nombre);
    const hasArea1 = user.permisos_area.some(p => p.area_id === 1);
    const hasSubAreas = user.permisos_area.some(p => p.area_id !== 1);

    console.log(`ID: ${user.id} | Rol: ${user.roles?.nombre || 'Ninguno'} | Nombre: ${user.nombre_completo} ${user.apellido_completo}`);
    console.log(`  Permisos: ${user.permisos_area.map(p => p.areas.nombre).join(', ')}`);

    if (!isDirectorOrAdmin && hasArea1 && hasSubAreas) {
      console.log('  -> [ACCION] Removiendo Area 1');
      updates.push(user.id);
    } else if (!isDirectorOrAdmin && hasArea1 && !hasSubAreas) {
        console.log('  -> [ALERTA] Este usuario SOLO tiene Area 1 y no es director!');
    }
  }

  if (updates.length > 0) {
    const res = await prisma.permisos_area.deleteMany({
      where: {
        usuario_id: { in: updates },
        area_id: 1
      }
    });
    console.log(`\nLimpieza completada: Se elimino el Area 1 a ${res.count} usuarios.`);
  } else {
    console.log('\nNo se requiere limpieza. Permisos correctos.');
  }

}
main().finally(() => prisma.disconnect());
