-- CreateTable
CREATE TABLE "core"."solicitudes_contacto" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "contacto_id" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizado" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_contacto_usuario_contacto_key" ON "core"."solicitudes_contacto"("usuario_id", "contacto_id");

-- CreateIndex
CREATE INDEX "idx_solicitudes_contacto_usuario" ON "core"."solicitudes_contacto"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_solicitudes_contacto_contacto" ON "core"."solicitudes_contacto"("contacto_id");

-- CreateIndex
CREATE INDEX "idx_solicitudes_contacto_estado" ON "core"."solicitudes_contacto"("estado");

-- AddForeignKey
ALTER TABLE "core"."solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "core"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."solicitudes_contacto" ADD CONSTRAINT "solicitudes_contacto_contacto_id_fkey" FOREIGN KEY ("contacto_id") REFERENCES "core"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
