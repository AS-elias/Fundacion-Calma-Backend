const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkDesempeño() {
  try {
    // Obtener todos los usuarios activos y sus actividades creadas
    const usuarios = await prisma.usuarios.findMany({
      where: { estado: 'ACTIVO' },
      select: {
        id: true,
        nombre_completo: true,
        apellido_completo: true,
        roles: {
          select: { nombre: true },
        },
      },
    });

    console.log('\n==== DESEMPEÑO PERSONAL POR USUARIO ====\n');

    for (const usuario of usuarios) {
      const totalCreadas = await prisma.desarrollo_actividades.count({
        where: { creador_id: usuario.id },
      });

      const completadas = await prisma.desarrollo_actividades.count({
        where: {
          creador_id: usuario.id,
          estado: 'COMPLETADO',
        },
      });

      const desempeño = totalCreadas > 0 ? Math.round((completadas / totalCreadas) * 100) : null;

      console.log(`👤 ${usuario.nombre_completo} ${usuario.apellido_completo}`);
      console.log(`   Rol: ${usuario.roles?.nombre || 'Sin rol'}`);
      console.log(`   Total creadas: ${totalCreadas}`);
      console.log(`   Completadas: ${completadas}`);
      console.log(`   Desempeño personal: ${desempeño !== null ? desempeño + '%' : 'N/A (sin tareas)'}`);
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDesempeño();
