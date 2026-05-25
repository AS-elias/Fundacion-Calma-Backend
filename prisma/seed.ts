import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando la base de datos de Fundación Calma...');

  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
  };

  // ===============================
  // 1. LIMPIAR DATA (ORDEN CORRECTO POR FK)
  // ===============================
  await prisma.actividad_enlaces.deleteMany();
  await prisma.desarrollo_actividades.deleteMany();
  await prisma.convenio_comentarios.deleteMany();
  await prisma.convenio_archivos.deleteMany();
  await prisma.convenio_historial.deleteMany();
  await prisma.convenios.deleteMany();
  await prisma.mensajes.deleteMany();
  await prisma.participantes_canal.deleteMany();
  await prisma.canales.deleteMany();
  await prisma.notificaciones.deleteMany();
  await prisma.publicaciones.deleteMany();
  await prisma.repositorio_enlaces.deleteMany();
  await prisma.repositorio_bloques.deleteMany();
  await prisma.recursos_area.deleteMany();
  await prisma.analisis_tarea_enlaces.deleteMany();
  await prisma.analisis_difusiones.deleteMany();
  await prisma.analisis_venues.deleteMany();
  await prisma.analisis_empresas.deleteMany();
  await prisma.analisis_colegios.deleteMany();
  await prisma.analisis_tareas.deleteMany();
  await prisma.estrategia_tareas.deleteMany();
  await prisma.proyectos.deleteMany();
  await prisma.permisos_area.deleteMany();
  await prisma.salas_trabajo.deleteMany();
  await prisma.usuarios.deleteMany();
  await prisma.areas.deleteMany();
  await prisma.roles.deleteMany();

  // ===============================
  // 2. ROLES
  // ===============================
  const rolAdministrador = await prisma.roles.create({
    data: { nombre: 'Administrador' },
  });
  const rolDirector = await prisma.roles.create({
    data: { nombre: 'Director' },
  });
  const rolPracticante = await prisma.roles.create({
    data: { nombre: 'Practicante' },
  });

  // ===============================
  // 3. ÁREAS
  // ===============================
  const areaPadre = await prisma.areas.create({
    data: { nombre: 'Estrategia y Desarrollo' },
  });

  const [estrategia, analisis, desarrollo] = await Promise.all([
    prisma.areas.create({
      data: { nombre: 'Estrategia Comercial', padre_id: areaPadre.id },
    }),
    prisma.areas.create({
      data: { nombre: 'Análisis de Datos', padre_id: areaPadre.id },
    }),
    prisma.areas.create({
      data: { nombre: 'Desarrollo Comercial', padre_id: areaPadre.id },
    }),
  ]);

  // ===============================
  // 4. USUARIOS
  // ===============================
  const passwordHash = await hashPassword('password123');
  const admin = await prisma.usuarios.create({
    data: {
      nombre_completo: 'Super',
      apellido_completo: 'Admin',
      email: 'admin@calma.org',
      password_hash: passwordHash,
      puesto: 'Administrador del Sistema',
      estado: 'ACTIVO',
      rol_id: rolAdministrador.id,
    },
  });

  // ===============================
  // 5. PERMISOS DE ÁREA (Admin global vs Director específico)
  // ===============================
  await prisma.permisos_area.createMany({
    data: [
      {
        usuario_id: admin.id,
        area_id: areaPadre.id,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
      {
        usuario_id: admin.id,
        area_id: estrategia.id,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
      {
        usuario_id: admin.id,
        area_id: analisis.id,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
      {
        usuario_id: admin.id,
        area_id: desarrollo.id,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
    ],
  });

  console.log('👤 Usuarios creados: ' + admin.email);

  // ===============================
  // 8. PUBLICACIONES (Asumo que era el bloque 8 por tu código original)
  // ===============================
  // ===============================
  // 9. REPOSITORIO BLOQUE
  // ===============================
  const bloquesRepositorio = [
    {
      area_id: areaPadre.id,
      titulo: 'MOF - Manual de Organización y Funciones',
      subtitulo: 'Documentos institucionales',
      icono: '\u{1F4C1}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Redes Sociales de la Fundación',
      subtitulo: 'Enlaces oficiales',
      icono: '\u{1F310}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Recursos Generales',
      subtitulo: 'Archivos generales',
      icono: '\u{1F4C4}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Políticas y Procedimientos',
      subtitulo: 'Normas internas',
      icono: '\u{1F4D1}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Reportes Estratégicos',
      subtitulo: 'Reportes y análisis',
      icono: '\u{1F4CA}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Materiales de Capacitación',
      subtitulo: 'Capacitaciones y guías',
      icono: '\u{1F4DA}',
      creado_por: admin.id,
    },
    {
      area_id: areaPadre.id,
      titulo: 'Plantillas Comerciales',
      subtitulo: 'Documentos oficiales',
      creado_por: admin.id,
    },
  ];

  const bloquesCreados = await Promise.all(
    bloquesRepositorio.map((bloque) =>
      prisma.repositorio_bloques.create({
        data: bloque,
      }),
    ),
  );

  const bloquePlantillas = bloquesCreados.find(
    (bloque) => bloque.titulo === 'Plantillas Comerciales',
  );

  if (!bloquePlantillas) {
    throw new Error('No se pudo crear el bloque Plantillas Comerciales');
  }

  // ===============================
  // 10. REPOSITORIO ENLACES
  // ===============================


  // ===============================
  // 11. RECURSOS ÁREA
  // ===============================
  await prisma.recursos_area.create({
    data: {
      area_id: estrategia.id,
      nombre_recurso: 'Dashboard Comercial',
      url_recurso: 'https://calma-dashboard.com',
      tipo_recurso: 'Herramienta',
      icono: 'chart-line',
    },
  });

  // ===============================
  // 12. TAREAS ESTRATEGIA
  // ===============================
  // ===============================
  // 13. NOTIFICACIONES
  // ===============================
  // ===============================
  // 14. DATA CONVENIOS
  // ===============================
  // ===============================
  // 15. DATA COMENTARIOS
  // ===============================
  // ===============================
  // 16. DATA ARCHIVOS
  // ===============================
  // ===============================
  // 17. ANALISIS TAREAS
  // ===============================
  // ===============================
  // 18. ACTIVIDADES DESARROLLO COMERCIAL
  // ===============================
  // ===============================
  // 19. SALAS DE TRABAJO
  // ===============================
  await prisma.salas_trabajo.createMany({
    data: [
      {
        nombre: 'Sala General - Fundación Calma',
        area: 'General',
        link: 'https://meet.google.com/fundacion-calma-general',
        descripcion: 'Sala principal para todas las reuniones generales',
        es_general: true,
        creador_id: admin.id,
      },
    ],
  });

  console.log('✅ Base de datos sembrada con éxito.');
}

// Solo se llama una vez a main()
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
