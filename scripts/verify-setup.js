const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function verifySetup() {
  try {
    // 1. Verificar que la tabla tiene usuario_id
    console.log('\n==== SCHEMA DE director_evaluaciones ====\n');
    const schema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'core' AND table_name = 'director_evaluaciones'
      ORDER BY ordinal_position;
    `;
    console.log(schema);

    // 2. Ver al director (ID 2 = Deivi Flores)
    console.log('\n==== DIRECTOR ====\n');
    const director = await prisma.usuarios.findUnique({
      where: { id: 2 },
      select: { id: true, nombre_completo: true, apellido_completo: true, roles: { select: { nombre: true } } },
    });
    console.log(director);

    // 3. Ver practicantes/analistas en la BD
    console.log('\n==== PRACTICANTES/ANALISTAS DISPONIBLES ====\n');
    const practicantes = await prisma.usuarios.findMany({
      where: {
        estado: 'ACTIVO',
        roles: {
          nombre: {
            in: ['Practicante', 'Analista'],
          },
        },
      },
      select: {
        id: true,
        nombre_completo: true,
        apellido_completo: true,
        roles: { select: { nombre: true } },
      },
    });
    console.log(practicantes);

    // 4. Llamar a getDirectorPendingUsers (simulado)
    console.log('\n==== USUARIOS PENDIENTES PARA DIRECTOR (ID 2) ====\n');
    const allowedAreaIds = await prisma.permisos_area.findMany({
      where: { usuario_id: 2 },
      select: { area_id: true },
    });
    const areaIds = allowedAreaIds.map(p => p.area_id).filter(Boolean);
    console.log('Áreas permitidas:', areaIds);

    if (areaIds.length > 0) {
      const pendingUsers = await prisma.usuarios.findMany({
        where: {
          id: { not: 2 },
          estado: 'ACTIVO',
          roles: {
            nombre: {
              notIn: ['Director', 'Administrador'],
            },
          },
          permisos_area: {
            some: {
              area_id: { in: areaIds },
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
      console.log('Usuarios pendientes:', pendingUsers);
    } else {
      console.log('Director no tiene áreas asignadas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
