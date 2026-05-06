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
    data: { nombre: 'Área Comercial' },
  });

  const [estrategia, analisis, desarrollo] = await Promise.all([
    prisma.areas.create({
      data: { nombre: 'Estrategia', padre_id: areaPadre.id },
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

  const director = await prisma.usuarios.create({
    data: {
      nombre_completo: 'Deivi',
      apellido_completo: 'Flores',
      email: 'dflores@calma.org',
      password_hash: passwordHash,
      puesto: 'Director Comercial',
      estado: 'ACTIVO',
      rol_id: rolDirector.id,
    },
  });

  const analistaUser = await prisma.usuarios.create({
    data: {
      nombre_completo: 'Lucía',
      apellido_completo: 'Ramírez',
      email: 'lramirez@calma.org',
      password_hash: passwordHash,
      puesto: 'Analista Datos',
      estado: 'ACTIVO',
      rol_id: rolPracticante.id,
    },
  });

  const practicante = await prisma.usuarios.create({
    data: {
      nombre_completo: 'Usuario',
      apellido_completo: 'Prueba',
      email: 'user@calma.org',
      password_hash: passwordHash,
      puesto: 'Relacionista Institucional',
      estado: 'ACTIVO',
      rol_id: rolPracticante.id,
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
      {
        usuario_id: director.id,
        area_id: areaPadre.id,
        puede_publicar: true,
        puede_editar: true,
        permitir_subareas: true,
      },
      {
        usuario_id: practicante.id,
        area_id: estrategia.id,
        puede_publicar: true,
        puede_editar: false,
        permitir_subareas: false,
      },
    ],
  });

  console.log(
    '👤 Usuarios creados: ' +
      [admin.email, director.email, practicante.email].join(', '),
  );

  // ===============================
  // 8. PUBLICACIONES (Asumo que era el bloque 8 por tu código original)
  // ===============================
  await prisma.publicaciones.create({
    data: {
      area_id: areaPadre.id,
      autor_id: director.id,
      titulo: 'Nuevo Convenio Educativo',
      contenido: 'Se firmó convenio con institución educativa.',
      fecha_publicacion: new Date(),
    },
  });

  // ===============================
  // 9. REPOSITORIO BLOQUE
  // ===============================
  const bloque = await prisma.repositorio_bloques.create({
    data: {
      area_id: areaPadre.id,
      titulo: 'Plantillas Comerciales',
      subtitulo: 'Documentos oficiales',
      creado_por: director.id,
    },
  });

  // ===============================
  // 10. REPOSITORIO ENLACES
  // ===============================
  await prisma.repositorio_enlaces.create({
    data: {
      bloque_id: bloque.id,
      nombre_documento: 'Plantilla Propuesta.docx',
      url_drive: 'https://drive.google.com/plantilla',
    },
  });

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
  await prisma.estrategia_tareas.create({
    data: {
      area_id: estrategia.id,
      titulo: 'Definir metas Q2',
      descripcion: 'Establecer objetivos comerciales del segundo trimestre.',
      estado: 'Pendiente',
      prioridad: 'Alta',
      fecha_vencimiento: new Date('2026-04-01'),
      creador_id: director.id,
      asignado_a_id: analistaUser.id,
    },
  });

  // ===============================
  // 13. NOTIFICACIONES
  // ===============================
  await prisma.notificaciones.create({
    data: {
      usuario_id: analistaUser.id,
      titulo: 'Nueva tarea asignada',
      mensaje: 'Se te asignó la tarea: Definir metas Q2',
      leido: false,
      tipo: 'TAREA',
    },
  });

  // ===============================
  // 14. DATA CONVENIOS
  // ===============================
  const convenioWiener = await prisma.convenios.create({
    data: {
      area_id: areaPadre.id,
      entidad_nombre: 'Universidad Norbert Wiener',
      ruc: '20123456789',
      rubro: 'Educación',
      contacto_nombre: 'María Gómez',
      telefono_contacto: '987654321',
      estado: 'PENDIENTE',
      tipo: 'EMPRESA PRIVADA',
      conexion: 'CONVENIO',
      fecha_expiracion: new Date('2026-12-31'),
      creador_id: director.id,
    },
  });

  // ===============================
  // 15. DATA COMENTARIOS
  // ===============================
  await prisma.convenio_comentarios.createMany({
    data: [
      {
        convenio_id: convenioWiener.id,
        usuario_id: director.id,
        comentario: 'Se envió propuesta institucional inicial.',
      },
    ],
  });

  // ===============================
  // 16. DATA ARCHIVOS
  // ===============================
  await prisma.convenio_archivos.createMany({
    data: [
      {
        convenio_id: convenioWiener.id,
        subido_por_id: director.id,
        nombre_archivo: 'Propuesta_Convenio_Wiener.pdf',
        url_archivo: 'https://drive.google.com/file/d/propuesta-wiener',
      },
    ],
  });

  // ===============================
  // 17. ANALISIS TAREAS
  // ===============================
  await prisma.analisis_tareas.createMany({
    data: [
      {
        area_id: analisis.id,
        titulo: 'Análisis de conversión de convenios',
        subtitulo: 'Medir tasa de cierre mensual',
        descripcion: 'Colegios de UGEL 04',
        estado: 'pendiente',
        creador_id: director.id,
      },
      {
        area_id: analisis.id,
        titulo: 'Reporte trimestral comercial',
        subtitulo: 'Resumen estratégico Q1',
        descripcion: 'Consolidar indicadores comerciales del trimestre',
        estado: 'en-proceso',
        creador_id: analistaUser.id,
      },
      {
        area_id: analisis.id,
        titulo: 'Actualización dashboard convenios',
        subtitulo: 'Integrar estado y fechas de expiración',
        descripcion: 'Actualizar visualizaciones principales',
        estado: 'completado',
        creador_id: analistaUser.id,
      },
      {
        area_id: analisis.id,
        titulo: 'Análisis de convenios cancelados',
        subtitulo: 'Identificar causas recurrentes',
        descripcion: 'Revisar causas de cancelacion',
        estado: 'paralizado',
        creador_id: director.id,
      },
      {
        area_id: analisis.id,
        titulo: 'Proyección de nuevos convenios 2026',
        subtitulo: 'Modelo predictivo basado en histórico',
        descripcion: 'Proyectar nuevos contactos institucionales',
        estado: 'en-proceso',
        creador_id: analistaUser.id,
      },
    ],
  });

  const tareaRecopilacion = await prisma.analisis_tareas.create({
    data: {
      area_id: analisis.id,
      titulo: 'RECOPILACION DE DATOS',
      descripcion: 'Colegios de UGEL 04',
      estado: 'pendiente',
      creador_id: director.id,
      analisis_tarea_enlaces: {
        create: [
          {
            nombre: 'Directorio UGEL 04',
            url: 'https://example.com/directorio-ugel-04',
          },
        ],
      },
    },
  });

  await prisma.analisis_tareas.create({
    data: {
      area_id: analisis.id,
      titulo: 'RECOPILACION DE DATOS',
      descripcion: 'Colegios de UGEL 04',
      estado: 'completado',
      creador_id: analistaUser.id,
      fecha_limite: new Date('2026-12-12T00:00:00'),
    },
  });

  await prisma.analisis_colegios.createMany({
    data: [
      {
        codigo_modular: '0324608',
        nombre: 'San Vicente de Paul',
        correo: 'secretaria@csvp.edu.pe',
        telefono: '999999999',
        nivel: 'Primaria',
        director: 'Chavez Luis Roger Ulises',
        tipo: 'Particular',
        ugel: 'UGEL 01',
        departamento: 'Lima',
        distrito: 'Surquillo',
        zona: 'Urbana',
        cantidad_alumnos: 291,
        direccion: 'Mz H lote 8',
      },
      {
        codigo_modular: '0324609',
        nombre: 'San Vicente de Paul',
        correo: 'secretaria@csvp.edu.pe',
        telefono: '999999999',
        nivel: 'Primaria',
        director: 'Chavez Luis Roger Ulises',
        tipo: 'Publica',
        ugel: 'UGEL 01',
        departamento: 'Lima',
        distrito: 'Surquillo',
        zona: 'Urbana',
        cantidad_alumnos: 291,
        direccion: 'Mz H lote 8',
      },
    ],
  });

  await prisma.analisis_empresas.createMany({
    data: [
      {
        ruc: '20602844219',
        nombre: 'Inversiones Distribuciones SAC',
        correo: 'operaciones@fulegsa.com.pe',
        telefono_fijo: '01025897',
        celular: '999999999',
        departamento: 'Lima',
        distrito: 'Surquillo',
        direccion: 'Mz H lote 8',
        sector: 'Educacion privada',
        estado: 'Convenio',
        descripcion: 'Esta empresa trabaja con la fundacion romero.',
      },
      {
        ruc: '20602844229',
        nombre: 'Inversiones Distribuciones EIRL',
        correo: 'operaciones@fulegsa.com.pe',
        telefono_fijo: '01025897',
        celular: '999999999',
        departamento: 'Lima',
        distrito: 'Surquillo',
        direccion: 'Mz H lote 8',
        sector: 'Educacion privada',
        estado: 'Alianza',
        descripcion: 'Esta empresa trabaja con la fundacion romero.',
      },
    ],
  });

  await prisma.analisis_venues.createMany({
    data: [
      {
        nombre: 'Villa Lucumo',
        departamento: 'Lima',
        distrito: 'Surquillo',
        direccion: 'Pachacamac, Lima',
        celular: '972162178',
        correo: 'villa.lucumo@gmail.com',
        capacidad_personas: 200,
        estado: 'Contactado',
        sitio_web: 'https://www.facebook.com/p/Villa-L%C3%BAcumo',
        detalles: 'Este venue trabaja en la fundacion romero',
      },
      {
        nombre: 'Villa Lucumo',
        departamento: 'Lima',
        distrito: 'Surquillo',
        direccion: 'Pachacamac, Lima',
        celular: '972162178',
        correo: 'villa.lucumo@gmail.com',
        capacidad_personas: 200,
        estado: 'Pendiente',
        sitio_web: 'https://www.facebook.com/p/Villa-L%C3%BAcumo',
        detalles: 'Este venue trabaja en la fundacion romero',
      },
    ],
  });

  await prisma.analisis_difusiones.createMany({
    data: [
      {
        nombre: 'Radio Exitosa',
        tipo: 'Radio',
        plataforma: 'YouTube',
        lugar: 'Lurin, Lima',
        contacto: 'Maria',
        celular: '972162178',
        correo: 'Maria.v@gmail.com',
        fecha: new Date('2026-12-12T00:00:00'),
        estado: 'Contactado',
        observaciones:
          'Este medio de comunicacion ya trabajo antes con una fundacion',
      },
      {
        nombre: 'Radio Exitosa',
        tipo: 'Radio',
        plataforma: 'YouTube',
        lugar: 'Lurin, Lima',
        contacto: 'Maria',
        celular: '972162178',
        correo: 'Maria.v@gmail.com',
        fecha: new Date('2026-12-12T00:00:00'),
        estado: 'Pendiente',
        observaciones:
          'Este medio de comunicacion ya trabajo antes con una fundacion',
      },
    ],
  });

  console.log(`Tarea de analisis creada: ${tareaRecopilacion.id}`);

  // ===============================
  // 18. ACTIVIDADES DESARROLLO COMERCIAL
  // ===============================
  await prisma.desarrollo_actividades.create({
    data: {
      area_id: desarrollo.id,
      titulo: 'Preparar propuesta para aliados estratégicos',
      descripcion:
        'Consolidar la propuesta institucional y los beneficios para aliados del sector educación.',
      estado: 'PENDIENTE',
      fecha_limite: new Date('2026-04-20'),
      creador_id: director.id,
      actividad_enlaces: {
        create: [
          {
            nombre_documento: 'Presentación institucional',
            url: 'https://docs.google.com/presentation/d/demo-propuesta',
          },
          {
            nombre_documento: 'Carpeta de materiales',
            url: 'https://drive.google.com/drive/folders/demo-materiales',
          },
        ],
      },
    },
  });

  await prisma.desarrollo_actividades.create({
    data: {
      area_id: desarrollo.id,
      titulo: 'Seguimiento de reuniones con universidades',
      descripcion:
        'Registrar avances y próximos pasos con las universidades priorizadas para nuevos convenios.',
      estado: 'EN PROCESO',
      fecha_limite: new Date('2026-04-15'),
      creador_id: practicante.id,
      actividad_enlaces: {
        create: [
          {
            nombre_documento: 'Matriz de seguimiento',
            url: 'https://docs.google.com/spreadsheets/d/demo-seguimiento',
          },
        ],
      },
    },
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
