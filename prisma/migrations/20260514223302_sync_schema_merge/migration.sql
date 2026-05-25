-- DropIndex
DROP INDEX "idx_salas_trabajo_area";

-- DropIndex
DROP INDEX "idx_salas_trabajo_creador";

-- DropIndex
DROP INDEX "idx_salas_trabajo_es_general";

-- AlterTable
ALTER TABLE "core"."notificaciones" ADD COLUMN     "imagen" TEXT;

-- RenameIndex
ALTER INDEX "core"."solicitudes_contacto_usuario_contacto_key" RENAME TO "solicitudes_contacto_usuario_id_contacto_id_key";
