CREATE TYPE "comercial"."EstrategiaActividadEstado" AS ENUM (
  'PENDIENTE',
  'EN_PROGRESO',
  'EN_REVISION',
  'EN_EJECUCION',
  'FINALIZADO',
  'PARALIZADO',
  'COMPLETADO'
);

CREATE TYPE "comercial"."EstrategiaPrioridad" AS ENUM (
  'ALTA',
  'MEDIA',
  'BAJA'
);

CREATE TYPE "comercial"."EstrategiaProyectoEstado" AS ENUM (
  'PENDIENTE',
  'EN_PROGRESO',
  'COMPLETADA',
  'PARALIZADO'
);

CREATE TABLE "comercial"."estrategia_actividades" (
  "id" SERIAL NOT NULL,
  "titulo" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "estado" "comercial"."EstrategiaActividadEstado" NOT NULL DEFAULT 'PENDIENTE',
  "creado_por" VARCHAR(120),
  "prioridad" "comercial"."EstrategiaPrioridad" NOT NULL DEFAULT 'MEDIA',
  "fecha_creacion" DATE DEFAULT CURRENT_TIMESTAMP,
  "fecha_limite" DATE,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "estrategia_actividades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comercial"."estrategia_actividad_enlaces" (
  "id" SERIAL NOT NULL,
  "actividad_id" INTEGER,
  "nombre" VARCHAR(255) NOT NULL,
  "url" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "estrategia_actividad_enlaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comercial"."estrategia_empresas" (
  "id" SERIAL NOT NULL,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "estrategia_empresas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comercial"."estrategia_proyectos" (
  "id" SERIAL NOT NULL,
  "empresa_id" INTEGER,
  "titulo" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "estado" "comercial"."EstrategiaProyectoEstado" NOT NULL DEFAULT 'PENDIENTE',
  "fecha_limite" DATE,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "estrategia_proyectos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comercial"."estrategia_proyecto_enlaces" (
  "id" SERIAL NOT NULL,
  "proyecto_id" INTEGER,
  "etiqueta" VARCHAR(255) NOT NULL,
  "url" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "estrategia_proyecto_enlaces_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_estrategia_actividades_estado" ON "comercial"."estrategia_actividades"("estado");
CREATE INDEX "idx_estrategia_actividades_prioridad" ON "comercial"."estrategia_actividades"("prioridad");
CREATE INDEX "idx_estrategia_actividad_enlaces_actividad" ON "comercial"."estrategia_actividad_enlaces"("actividad_id");
CREATE INDEX "idx_estrategia_proyectos_empresa" ON "comercial"."estrategia_proyectos"("empresa_id");
CREATE INDEX "idx_estrategia_proyectos_estado" ON "comercial"."estrategia_proyectos"("estado");
CREATE INDEX "idx_estrategia_proyecto_enlaces_proyecto" ON "comercial"."estrategia_proyecto_enlaces"("proyecto_id");

ALTER TABLE "comercial"."estrategia_actividad_enlaces"
ADD CONSTRAINT "estrategia_actividad_enlaces_actividad_id_fkey"
FOREIGN KEY ("actividad_id") REFERENCES "comercial"."estrategia_actividades"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "comercial"."estrategia_proyectos"
ADD CONSTRAINT "estrategia_proyectos_empresa_id_fkey"
FOREIGN KEY ("empresa_id") REFERENCES "comercial"."estrategia_empresas"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "comercial"."estrategia_proyecto_enlaces"
ADD CONSTRAINT "estrategia_proyecto_enlaces_proyecto_id_fkey"
FOREIGN KEY ("proyecto_id") REFERENCES "comercial"."estrategia_proyectos"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
