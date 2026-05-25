const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testNuevoUsuario() {
  try {
    console.log('\n==== CREANDO NUEVO USUARIO (PRACTICANTE) ====\n');

    // Simular la creación de un usuario nuevo
    const nuevoUsuario = {
      nombre_completo: 'Test',
      apellido_completo: 'Usuario',
      email: `testuser-${Date.now()}@calma.org`,
      password_hash: await bcrypt.hash('password123', 10),
      puesto: 'Practicante Prueba',
      estado: 'ACTIVO',
      rol_id: 4, // Practicante
    };

    const usuario = await prisma.usuarios.create({
      data: nuevoUsuario,
      include: { roles: true },
    });

    console.log('✓ Usuario creado:', usuario.email);

    // Asignar áreas automáticamente (como lo hace el nuevo código)
    console.log('\nAsignando áreas automáticamente...\n');

    const areaComercial = await prisma.areas.findFirst({
      where: { nombre: 'Área Comercial' },
      select: { id: true, nombre: true },
    });

    if (areaComercial) {
      await prisma.permisos_area.create({
        data: {
          usuario_id: usuario.id,
          area_id: areaComercial.id,
          puede_publicar: false,
          puede_editar: false,
          permitir_subareas: false,
        },
      });
      console.log(`✓ Área asignada: ${areaComercial.nombre} (ID: ${areaComercial.id})`);
    }

    // Verificar que ahora el usuario tiene áreas
    console.log('\nVerificando permisos del nuevo usuario...\n');

    const permisosUsuario = await prisma.permisos_area.findMany({
      where: { usuario_id: usuario.id },
      include: { areas: true },
    });

    console.log('Áreas asignadas:');
    permisosUsuario.forEach(p => {
      console.log(`  - ${p.areas.nombre} (puede_publicar: ${p.puede_publicar}, puede_editar: ${p.puede_editar})`);
    });

    // Verificar que el usuario es evaluable por el director
    console.log('\n¿Es este usuario evaluable por el director?\n');

    const directorAreas = await prisma.permisos_area.findMany({
      where: { usuario_id: 7 }, // Director ID
      select: { area_id: true },
    });

    const directorAreaIds = directorAreas.map(p => p.area_id);
    console.log('Áreas del director (ID 7):', directorAreaIds);

    const esEvaluable = permisosUsuario.some(p => directorAreaIds.includes(p.area_id));
    console.log(`✓ ¿Evaluable?: ${esEvaluable ? 'SÍ' : 'NO'}`);

    console.log('\n==== FLUJO COMPLETADO ====\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNuevoUsuario();
