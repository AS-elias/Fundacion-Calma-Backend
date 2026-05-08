CREATE TABLE "comercial"."convenio_historial" (
    "id" SERIAL NOT NULL,
    "convenio_id" INTEGER,
    "usuario_id" INTEGER,
    "accion" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convenio_historial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_historial_convenio" ON "comercial"."convenio_historial"("convenio_id");

ALTER TABLE "comercial"."convenio_historial"
ADD CONSTRAINT "convenio_historial_convenio_id_fkey"
FOREIGN KEY ("convenio_id") REFERENCES "comercial"."convenios"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "comercial"."convenio_historial"
ADD CONSTRAINT "convenio_historial_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "core"."usuarios"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;
