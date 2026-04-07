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
  await prisma.convenio_comentarios.deleteMany();
  await prisma.convenio_archivos.deleteMany();
  await prisma.convenios.deleteMany();
  await prisma.mensajes.deleteMany();
  await prisma.participantes_canal.deleteMany();
  await prisma.canales.deleteMany();
  await prisma.notificaciones.deleteMany();
  await prisma.publicaciones.deleteMany();
  await prisma.repositorio_enlaces.deleteMany();
  await prisma.repositorio_bloques.deleteMany();
  await prisma.recursos_area.deleteMany();
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
  const rolAdministrador = await prisma.roles.create({ data: { nombre: 'Administrador' } });
  const rolDirector = await prisma.roles.create({ data: { nombre: 'Director' } });
  const rolPracticante = await prisma.roles.create({ data: { nombre: 'Practicante' } });

  // ===============================
  // 3. ÁREAS
  // ===============================
  const areaPadre = await prisma.areas.create({ data: { nombre: 'Área Comercial' } });

  const [estrategia, analisis, desarrollo] = await Promise.all([
    prisma.areas.create({ data: { nombre: 'Estrategia', padre_id: areaPadre.id } }),
    prisma.areas.create({ data: { nombre: 'Análisis de Datos', padre_id: areaPadre.id } }),
    prisma.areas.create({ data: { nombre: 'Desarrollo', padre_id: areaPadre.id } }),
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
      puesto: 'Analista Comercial',
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
      puesto: 'Practicante',
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

  console.log('👤 Usuarios creados: ' + [admin.email, director.email, practicante.email].join(', '));

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
      fecha_expiracion: new Date('2026-12-31'),
      creador_id: director.id,
    },
  });

  const convenioBCP = await prisma.convenios.create({
    data: {
      area_id: areaPadre.id,
      entidad_nombre: 'Banco de Crédito del Perú',
      ruc: '20234567891',
      rubro: 'Finanzas',
      contacto_nombre: 'Carlos Ruiz',
      telefono_contacto: '912345678',
      estado: 'EN PROCESO',
      fecha_expiracion: new Date('2027-05-15'),
      creador_id: director.id,
    },
  });

  const convenioClinica = await prisma.convenios.create({
    data: {
      area_id: areaPadre.id,
      entidad_nombre: 'Clínica Internacional',
      ruc: '20345678912',
      rubro: 'Salud',
      contacto_nombre: 'Ana Torres',
      telefono_contacto: '998877665',
      estado: 'PROCESO DE CONVENIO',
      fecha_expiracion: new Date('2026-08-20'),
      creador_id: director.id,
    },
  });

  const convenioTech = await prisma.convenios.create({
    data: {
      area_id: areaPadre.id,
      entidad_nombre: 'Tech Solutions SAC',
      ruc: '20456789123',
      rubro: 'Tecnología',
      contacto_nombre: 'Luis Mendoza',
      telefono_contacto: '955443322',
      estado: 'REUNIÓN AGENDADA',
      fecha_expiracion: new Date('2025-11-01'),
      creador_id: director.id,
    },
  });

  const convenioColegio = await prisma.convenios.create({
    data: {
      area_id: areaPadre.id,
      entidad_nombre: 'Colegio San Martín',
      ruc: '20567891234',
      rubro: 'Educación',
      contacto_nombre: 'Patricia Salas',
      telefono_contacto: '944556677',
      estado: 'CONVENIO FIRMADO',
      fecha_expiracion: new Date('2028-03-10'),
      creador_id: director.id,
    },
  });

  // ===============================
  // 15. DATA COMENTARIOS
  // ===============================
  await prisma.convenio_comentarios.createMany({
    data: [
      { convenio_id: convenioWiener.id, usuario_id: director.id, comentario: 'Se envió propuesta institucional inicial.' },
      { convenio_id: convenioWiener.id, usuario_id: director.id, comentario: 'Pendiente validación del área legal.' },
      { convenio_id: convenioBCP.id, usuario_id: director.id, comentario: 'Reunión estratégica realizada con gerencia comercial.' },
      { convenio_id: convenioClinica.id, usuario_id: director.id, comentario: 'Se solicitó documentación financiera complementaria.' },
      { convenio_id: convenioColegio.id, usuario_id: director.id, comentario: 'Convenio firmado y archivado correctamente.' },
    ],
  });

  // ===============================
  // 16. DATA ARCHIVOS
  // ===============================
  await prisma.convenio_archivos.createMany({
    data: [
      { convenio_id: convenioWiener.id, subido_por_id: director.id, nombre_archivo: 'Propuesta_Convenio_Wiener.pdf', url_archivo: 'https://drive.google.com/file/d/propuesta-wiener' },
      { convenio_id: convenioWiener.id, subido_por_id: director.id, nombre_archivo: 'Carta_Intento_Wiener.docx', url_archivo: 'https://drive.google.com/file/d/carta-intento-wiener' },
      { convenio_id: convenioBCP.id, subido_por_id: director.id, nombre_archivo: 'Contrato_BCP.pdf', url_archivo: 'https://drive.google.com/file/d/contrato-bcp' },
      { convenio_id: convenioClinica.id, subido_por_id: director.id, nombre_archivo: 'Propuesta_Clinica.pdf', url_archivo: 'https://drive.google.com/file/d/propuesta-clinica' },
      { convenio_id: convenioColegio.id, subido_por_id: director.id, nombre_archivo: 'Convenio_Firmado_Colegio.pdf', url_archivo: 'https://drive.google.com/file/d/convenio-firmado-colegio' },
    ],
  });

  // ===============================
  // 17. ANALISIS TAREAS
  // ===============================
  await prisma.analisis_tareas.createMany({
    data: [
      { area_id: analisis.id, categoria: 'KPIs', titulo: 'Análisis de conversión de convenios', subtitulo: 'Medir tasa de cierre mensual', estado: 'PENDIENTE', creador_id: director.id },
      { area_id: analisis.id, categoria: 'Reporte', titulo: 'Reporte trimestral comercial', subtitulo: 'Resumen estratégico Q1', estado: 'EN PROCESO', creador_id: analistaUser.id },
      { area_id: analisis.id, categoria: 'Dashboard', titulo: 'Actualización dashboard convenios', subtitulo: 'Integrar estado y fechas de expiración', estado: 'COMPLETADO', creador_id: analistaUser.id },
      { area_id: analisis.id, categoria: 'Seguimiento', titulo: 'Análisis de convenios cancelados', subtitulo: 'Identificar causas recurrentes', estado: 'PENDIENTE', creador_id: director.id },
      { area_id: analisis.id, categoria: 'Proyección', titulo: 'Proyección de nuevos convenios 2026', subtitulo: 'Modelo predictivo basado en histórico', estado: 'EN PROCESO', creador_id: analistaUser.id },
    ],
  });

  console.log('✅ Base de datos sembrada con éxito.');
} // ¡Aquí es donde realmente debe cerrar la función main!

// Solo se llama una vez a main()
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });