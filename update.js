const fs = require('fs');
const p = 'src/modules/dashboard/dashboard.service.ts';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'const totalProyectos = totalProyectosDB;',
  'const conveniosCount = await this.prisma.convenios.count();\n    const empresasCount = await this.prisma.estrategia_empresas.count();\n    const totalProyectos = totalProyectosDB + actividadCountDesarrollo + actividadCountEstrategia + actividadCountAnalisis + conveniosCount + empresasCount;'
);

c = c.replace(
  'const misProyectos = await this.prisma.proyectos.count({\r\n      where: {\r\n        OR: [{ area_id: { in: filterAreaIds } }, { responsable_id: usuarioId }],\r\n      },\r\n    });',
  'let misProyectos = 0;\n    if (hasDesarrolloComercial) {\n      misProyectos += await this.prisma.convenios.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n      misProyectos += await this.prisma.desarrollo_actividades.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }\n    if (hasAnalisis) {\n      misProyectos += await this.prisma.analisis_tareas.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }\n    if (hasEstrategia) {\n      misProyectos += await this.prisma.proyectos.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { responsable_id: usuarioId }] } });\n      misProyectos += await this.prisma.estrategia_actividades.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n      misProyectos += await this.prisma.estrategia_empresas.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }'
);
c = c.replace(
  'const misProyectos = await this.prisma.proyectos.count({\n      where: {\n        OR: [{ area_id: { in: filterAreaIds } }, { responsable_id: usuarioId }],\n      },\n    });',
  'let misProyectos = 0;\n    if (hasDesarrolloComercial) {\n      misProyectos += await this.prisma.convenios.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n      misProyectos += await this.prisma.desarrollo_actividades.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }\n    if (hasAnalisis) {\n      misProyectos += await this.prisma.analisis_tareas.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }\n    if (hasEstrategia) {\n      misProyectos += await this.prisma.proyectos.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { responsable_id: usuarioId }] } });\n      misProyectos += await this.prisma.estrategia_actividades.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n      misProyectos += await this.prisma.estrategia_empresas.count({ where: { OR: [{ area_id: { in: filterAreaIds } }, { creador_id: usuarioId }] } });\n    }'
);

fs.writeFileSync(p, c);
console.log('Done');
