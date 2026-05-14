-- CreateTable salas_trabajo
CREATE TABLE "public"."salas_trabajo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "area" VARCHAR(200) NOT NULL,
    "link" TEXT NOT NULL,
    "descripcion" VARCHAR(500),
    "es_general" BOOLEAN NOT NULL DEFAULT false,
    "creador_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "salas_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_salas_trabajo_area" ON "public"."salas_trabajo"("area");
CREATE INDEX "idx_salas_trabajo_es_general" ON "public"."salas_trabajo"("es_general");
CREATE INDEX "idx_salas_trabajo_creador" ON "public"."salas_trabajo"("creador_id");

-- AddForeignKey
ALTER TABLE "public"."salas_trabajo" ADD CONSTRAINT "salas_trabajo_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "core"."usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
