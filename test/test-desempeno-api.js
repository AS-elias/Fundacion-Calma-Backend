const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function probarDesempenoIndividual() {
  try {
    console.log('\n════════════════════════════════════════════════════════════\n');
    console.log('PROBANDO DESEMPEÑO INDIVIDUAL - ENDPOINT: GET /dashboard/user\n');
    console.log('════════════════════════════════════════════════════════════\n');

    // Las credenciales de los usuarios de prueba
    const usuarios = [
      {
        email: 'dflores@calma.org',
        password: 'password123',
        nombre: 'Director (Deivi Flores)',
      },
      {
        email: 'lramirez@calma.org',
        password: 'password123',
        nombre: 'Practicante (Lucía Ramírez)',
      },
      {
        email: 'user@calma.org',
        password: 'password123',
        nombre: 'Practicante (Usuario Prueba)',
      },
    ];

    for (const usuario of usuarios) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📊 PROBANDO: ${usuario.nombre}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      try {
        // 1. Login
        console.log('1️⃣  Autenticando usuario...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: usuario.email,
          password: usuario.password,
        });

        const token = loginResponse.data.access_token;
        const usuarioData = loginResponse.data.user;
        console.log(`✓ Login exitoso (ID: ${usuarioData.id}, Rol: ${usuarioData.rol})\n`);

        // 2. Obtener dashboard personal
        console.log('2️⃣  Obteniendo datos de desempeño personal...');
        const dashboardResponse = await axios.get(`${API_URL}/dashboard/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dashboard = dashboardResponse.data;
        console.log('✓ Datos recibidos:\n');

        console.log('📋 INFORMACIÓN GENERAL:');
        console.log(`  Nombre: ${dashboard.usuario?.nombre_completo || 'N/A'}`);
        console.log(`  Email: ${dashboard.usuario?.email || 'N/A'}`);
        console.log(`  Rol: ${dashboard.usuario?.rol || 'N/A'}`);
        console.log();

        console.log('📍 ÁREAS ASIGNADAS:');
        if (dashboard.areasDelUsuario && dashboard.areasDelUsuario.length > 0) {
          dashboard.areasDelUsuario.forEach(area => {
            console.log(`  - ${area.nombre}`);
          });
        } else {
          console.log('  ⚠️  SIN ÁREAS ASIGNADAS');
        }
        console.log();

        console.log('📈 DESEMPEÑO:');
        console.log(`  Desempeño personal: ${dashboard.desempenoPersonal || 'N/A'}%`);
        console.log(`  Desempeño equipo: ${dashboard.desempenoEquipo || 'N/A'}%`);
        console.log();

        if (usuarioData.rol === 'Director') {
          console.log('👥 DATOS DE DIRECTOR:');
          console.log(`  Usuarios pendientes de evaluar: ${dashboard.pendientesEvaluacion?.length || 0}`);
          if (dashboard.pendientesEvaluacion && dashboard.pendientesEvaluacion.length > 0) {
            dashboard.pendientesEvaluacion.forEach(u => {
              console.log(`    - ${u.nombre} (${u.email})`);
            });
          }
          console.log(`  Evaluaciones realizadas: ${dashboard.directorEvaluations?.length || 0}`);
          if (dashboard.directorEvaluations && dashboard.directorEvaluations.length > 0) {
            dashboard.directorEvaluations.forEach(e => {
              console.log(`    - ${e.usuario_nombre || 'N/A'}: ${e.rating}/5`);
            });
          }
          console.log(`  Promedio evaluación director: ${dashboard.promedioEvaluacionDirector || 'N/A'}`);
          console.log();
        }

        console.log('📊 PROYECTOS Y CONVENIOS:');
        console.log(`  Mis proyectos: ${dashboard.misProyectos?.length || 0}`);
        console.log(`  Mis convenios: ${dashboard.misConvenios?.length || 0}`);
        console.log();

        console.log('✅ Datos completamente extraídos sin errores\n');

      } catch (error) {
        if (error.response) {
          console.log(`❌ Error HTTP: ${error.response.status}`);
          console.log(`Mensaje: ${JSON.stringify(error.response.data)}\n`);
        } else {
          console.log(`❌ Error: ${error.message}\n`);
        }
      }
    }

    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

// Ejecutar
probarDesempenoIndividual();
