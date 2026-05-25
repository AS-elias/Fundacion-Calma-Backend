const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function obtenerDatosUsuario() {
  try {
    console.log('\n════════════════════════════════════════════════════════════\n');
    console.log('EXTRAYENDO DATOS DE USUARIOS Y DESEMPEÑO\n');

    // 1. Obtener todos los usuarios
    const usuarios = await prisma.usuarios.findMany({
      include: {
        roles: true,
        permisos_area: {
          include: { areas: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('USUARIOS EN EL SISTEMA\n');
    
    usuarios.forEach(u => {
      console.log(`[ID: ${u.id}] ${u.nombre_completo} ${u.apellido_completo}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Rol: ${u.roles.nombre}`);
      console.log(`  Estado: ${u.estado}`);
      console.log(`  Áreas asignadas:`);
      if (u.permisos_area.length === 0) {
        console.log('    ⚠️  SIN ÁREAS ASIGNADAS');
      } else {
        u.permisos_area.forEach(p => {
          console.log(`    - ${p.areas.nombre} (permite_subareas: ${p.permitir_subareas})`);
        });
      }
      console.log();
    });

    // 2. Obtener evaluaciones directas por rol
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('EVALUACIONES DE DIRECTOR\n');

    const evaluaciones = await prisma.director_evaluaciones.findMany({
      include: {
        director: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            apellido_completo: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (evaluaciones.length === 0) {
      console.log('❌ No hay evaluaciones registradas aún\n');
    } else {
      evaluaciones.forEach(e => {
        console.log(`Director: ${e.director?.nombre_completo || 'N/A'} → Usuario: ${e.usuario?.nombre_completo || 'N/A'}`);
        console.log(`  Rating: ${e.rating}/5`);
        console.log(`  Comentario: ${e.comentario || 'N/A'}`);
        console.log(`  Fecha: ${e.created_at.toLocaleString('es-ES')}`);
        console.log();
      });
    }

    // 3. Desempeño por usuario (tareas/actividades creadas)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DESEMPEÑO INDIVIDUAL (BASADO EN TAREAS CREADAS)\n');

    for (const usuario of usuarios) {
      const analisisTareas = await prisma.analisis_tareas.findMany({
        where: { creador_id: usuario.id },
      });

      const estrategiaTareas = await prisma.estrategia_tareas.findMany({
        where: { creador_id: usuario.id },
      });

      const totalTareas = analisisTareas.length + estrategiaTareas.length;
      const completadas = 
        analisisTareas.filter(t => t.estado === 'completada').length +
        estrategiaTareas.filter(t => t.estado === 'completada').length;

      const desempenoPorcentaje = totalTareas > 0
        ? Math.round((completadas / totalTareas) * 100)
        : 0;

      console.log(`[${usuario.id}] ${usuario.nombre_completo}`);
      console.log(`  Total tareas de análisis: ${analisisTareas.length}`);
      console.log(`  Total tareas de estrategia: ${estrategiaTareas.length}`);
      console.log(`  Total tareas: ${totalTareas}`);
      console.log(`  Completadas: ${completadas}`);
      console.log(`  % Completación: ${desempenoPorcentaje}%`);

      // Mostrar promedio de evaluaciones del director
      const evaluacionesRecibidas = evaluaciones.filter(e => e.usuario_id === usuario.id);
      if (evaluacionesRecibidas.length > 0) {
        const promedio = (evaluacionesRecibidas.reduce((sum, e) => sum + e.rating, 0) / evaluacionesRecibidas.length).toFixed(2);
        console.log(`  Promedio evaluación director: ${promedio}/5 (${evaluacionesRecibidas.length} evaluaciones)`);
      }

      console.log();
    }

    // 4. Ver relación usuario-área-director
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ÁREAS Y SUS DIRECTORES\n');

    const areas = await prisma.areas.findMany({
      include: {
        permisos_area: {
          where: {
            usuarios: { roles: { nombre: 'Director' } },
          },
          include: {
            usuarios: { select: { nombre_completo: true, apellido_completo: true } },
          },
        },
      },
    });

    areas.forEach(area => {
      console.log(`ÁREA: ${area.nombre} (ID: ${area.id})`);
      if (area.permisos_area.length === 0) {
        console.log('  ⚠️  Sin directores asignados\n');
      } else {
        area.permisos_area.forEach(p => {
          console.log(`  Director: ${p.usuarios.nombre_completo} ${p.usuarios.apellido_completo}`);
        });
        console.log();
      }
    });

    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

obtenerDatosUsuario();
