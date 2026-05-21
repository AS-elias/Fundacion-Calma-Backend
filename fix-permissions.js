const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPermissions() {
  try {
    console.log('Asignando a Lucía Ramírez (ID 8) al Área Comercial (ID 5)...\n');

    // Asignar Lucía al área del director
    const perm = await prisma.permisos_area.create({
      data: {
        usuario_id: 8,
        area_id: 5, // Área Comercial
        permitir_subareas: true,
      },
    });

    console.log('✓ Permiso creado:', perm);

    // Verificar que ahora Lucía está pendiente de evaluación
    console.log('\nVerificando usuarios pendientes del director (ID 7)...\n');

    const directorAreaIds = await prisma.permisos_area.findMany({
      where: { usuario_id: 7 },
      select: { area_id: true },
    });

    const directorAreas = directorAreaIds.map(p => p.area_id).filter(Boolean);
    console.log('Áreas del director:', directorAreas);

    const pendingUsers = await prisma.usuarios.findMany({
      where: {
        id: { not: 7 },
        estado: 'ACTIVO',
        roles: {
          nombre: {
            notIn: ['Director', 'Administrador'],
          },
        },
        permisos_area: {
          some: {
            area_id: { in: directorAreas.length > 0 ? directorAreas : [-1] },
          },
        },
      },
      select: {
        id: true,
        nombre_completo: true,
        apellido_completo: true,
        email: true,
        roles: { select: { nombre: true } },
      },
    });

    console.log('\nUsuarios pendientes para evaluación:');
    console.log(pendingUsers);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
