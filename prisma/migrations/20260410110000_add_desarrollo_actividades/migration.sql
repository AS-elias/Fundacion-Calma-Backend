CREATE TABLE "comercial"."desarrollo_actividades" (
    "id" SERIAL NOT NULL,
    "area_id" INTEGER,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(30) DEFAULT 'PENDIENTE',
    "fecha_limite" DATE,
    "creador_id" INTEGER,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6),

    CONSTRAINT "desarrollo_actividades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comercial"."actividad_enlaces" (
    "id" SERIAL NOT NULL,
    "actividad_id" INTEGER,
    "nombre_documento" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_enlaces_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_actividad_desarrollo_area" ON "comercial"."desarrollo_actividades"("area_id");
CREATE INDEX "idx_actividad_desarrollo_estado" ON "comercial"."desarrollo_actividades"("estado");
CREATE INDEX "idx_actividad_desarrollo_fecha_limite" ON "comercial"."desarrollo_actividades"("fecha_limite");
CREATE INDEX "idx_actividad_enlaces_actividad" ON "comercial"."actividad_enlaces"("actividad_id");

ALTER TABLE "comercial"."desarrollo_actividades"
ADD CONSTRAINT "desarrollo_actividades_area_id_fkey"
FOREIGN KEY ("area_id") REFERENCES "core"."areas"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "comercial"."desarrollo_actividades"
ADD CONSTRAINT "desarrollo_actividades_creador_id_fkey"
FOREIGN KEY ("creador_id") REFERENCES "core"."usuarios"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "comercial"."actividad_enlaces"
ADD CONSTRAINT "actividad_enlaces_actividad_id_fkey"
FOREIGN KEY ("actividad_id") REFERENCES "comercial"."desarrollo_actividades"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
