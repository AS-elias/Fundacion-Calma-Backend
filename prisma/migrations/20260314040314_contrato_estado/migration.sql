/*
  Warnings:

  - The `estado` column on the `usuarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "core"."UserEstado" AS ENUM ('ACTIVO', 'INACTIVO');

-- AlterTable
ALTER TABLE "core"."usuarios" ADD COLUMN     "fecha_fin_contrato" TIMESTAMP(3),
DROP COLUMN "estado",
ADD COLUMN     "estado" "core"."UserEstado" NOT NULL DEFAULT 'ACTIVO';
