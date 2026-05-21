const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDirectors() {
  try {
    console.log('\n==== TODOS LOS USUARIOS ====\n');
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre_completo: true,
        apellido_completo: true,
        estado: true,
        roles: { select: { nombre: true } },
        permisos_area: {
          select: {
            area_id: true,
            areas: { select: { nombre: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    for (const u of usuarios) {
      console.log(`\nID: ${u.id}`);
      console.log(`Nombre: ${u.nombre_completo} ${u.apellido_completo}`);
      console.log(`Rol: ${u.roles?.nombre || 'Sin rol'}`);
      console.log(`Estado: ${u.estado}`);
      if (u.permisos_area.length > 0) {
        console.log(`Áreas: ${u.permisos_area.map(p => `${p.areas.nombre} (${p.area_id})`).join(', ')}`);
      } else {
        console.log('Áreas: NINGUNA');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDirectors();
