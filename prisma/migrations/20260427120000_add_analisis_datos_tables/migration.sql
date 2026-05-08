ALTER TABLE "comercial"."analisis_tareas"
ADD COLUMN IF NOT EXISTS "descripcion" TEXT,
ADD COLUMN IF NOT EXISTS "fecha_limite" DATE,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6);

ALTER TABLE "comercial"."analisis_tareas"
ALTER COLUMN "categoria" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'pendiente';

CREATE TABLE IF NOT EXISTS "comercial"."analisis_tarea_enlaces" (
    "id" SERIAL NOT NULL,
    "tarea_id" INTEGER,
    "nombre" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analisis_tarea_enlaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "comercial"."analisis_colegios" (
    "id" SERIAL NOT NULL,
    "codigo_modular" VARCHAR(20),
    "nombre" VARCHAR(200) NOT NULL,
    "correo" VARCHAR(120),
    "telefono" VARCHAR(30),
    "nivel" VARCHAR(80),
    "director" VARCHAR(150),
    "tipo" VARCHAR(30),
    "ugel" VARCHAR(80),
    "departamento" VARCHAR(80),
    "distrito" VARCHAR(80),
    "zona" VARCHAR(50),
    "cantidad_alumnos" INTEGER,
    "direccion" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analisis_colegios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "comercial"."analisis_empresas" (
    "id" SERIAL NOT NULL,
    "ruc" VARCHAR(11),
    "nombre" VARCHAR(200) NOT NULL,
    "correo" VARCHAR(120),
    "telefono_fijo" VARCHAR(30),
    "celular" VARCHAR(30),
    "departamento" VARCHAR(80),
    "distrito" VARCHAR(80),
    "direccion" TEXT,
    "sector" VARCHAR(120),
    "estado" VARCHAR(30),
    "descripcion" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analisis_empresas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "comercial"."analisis_venues" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "departamento" VARCHAR(80),
    "distrito" VARCHAR(80),
    "direccion" TEXT,
    "celular" VARCHAR(30),
    "correo" VARCHAR(120),
    "capacidad_personas" INTEGER,
    "estado" VARCHAR(30),
    "sitio_web" TEXT,
    "detalles" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analisis_venues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "comercial"."analisis_difusiones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(80),
    "plataforma" VARCHAR(80),
    "lugar" VARCHAR(150),
    "contacto" VARCHAR(150),
    "celular" VARCHAR(30),
    "correo" VARCHAR(120),
    "fecha" DATE,
    "estado" VARCHAR(30),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analisis_difusiones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_analisis_tarea_enlaces_tarea" ON "comercial"."analisis_tarea_enlaces"("tarea_id");
CREATE INDEX IF NOT EXISTS "idx_analisis_colegios_codigo_modular" ON "comercial"."analisis_colegios"("codigo_modular");
CREATE INDEX IF NOT EXISTS "idx_analisis_colegios_tipo" ON "comercial"."analisis_colegios"("tipo");
CREATE INDEX IF NOT EXISTS "idx_analisis_empresas_ruc" ON "comercial"."analisis_empresas"("ruc");
CREATE INDEX IF NOT EXISTS "idx_analisis_empresas_estado" ON "comercial"."analisis_empresas"("estado");
CREATE INDEX IF NOT EXISTS "idx_analisis_venues_estado" ON "comercial"."analisis_venues"("estado");
CREATE INDEX IF NOT EXISTS "idx_analisis_difusiones_estado" ON "comercial"."analisis_difusiones"("estado");

ALTER TABLE "comercial"."analisis_tarea_enlaces"
DROP CONSTRAINT IF EXISTS "analisis_tarea_enlaces_tarea_id_fkey";

ALTER TABLE "comercial"."analisis_tarea_enlaces"
ADD CONSTRAINT "analisis_tarea_enlaces_tarea_id_fkey"
FOREIGN KEY ("tarea_id") REFERENCES "comercial"."analisis_tareas"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
