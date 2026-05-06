-- AlterTable
ALTER TABLE "core"."canales" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "descripcion" VARCHAR(255);

-- AlterTable
ALTER TABLE "core"."mensajes" ADD COLUMN     "tipo" VARCHAR(20);

-- CreateTable
CREATE TABLE "core"."reacciones_mensaje" (
    "id" SERIAL NOT NULL,
    "mensaje_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "creado_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacciones_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reacciones_mensaje_mensaje" ON "core"."reacciones_mensaje"("mensaje_id");

-- CreateIndex
CREATE INDEX "idx_reacciones_mensaje_usuario" ON "core"."reacciones_mensaje"("usuario_id");

-- AddForeignKey
ALTER TABLE "core"."reacciones_mensaje" ADD CONSTRAINT "reacciones_mensaje_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "core"."mensajes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."reacciones_mensaje" ADD CONSTRAINT "reacciones_mensaje_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "core"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
