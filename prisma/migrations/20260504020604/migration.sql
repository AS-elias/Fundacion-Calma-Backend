/*
  Warnings:

  - You are about to alter the column `ruc` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(11)`.
  - You are about to alter the column `telefono_contacto` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(9)`.

*/
-- AlterTable
ALTER TABLE "comercial"."convenios" ALTER COLUMN "ruc" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "telefono_contacto" SET DATA TYPE VARCHAR(9),
ALTER COLUMN "estado" DROP DEFAULT,
ALTER COLUMN "estado" SET DATA TYPE TEXT,
ALTER COLUMN "conexion" SET DATA TYPE TEXT,
ALTER COLUMN "tipo" SET DATA TYPE TEXT;
