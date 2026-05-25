CREATE TABLE IF NOT EXISTS "core"."notificacion_lecturas" (
  "notificacion_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "leido" BOOLEAN NOT NULL DEFAULT false,
  "favorito" BOOLEAN NOT NULL DEFAULT false,
  "archivado" BOOLEAN NOT NULL DEFAULT false,
  "actualizado_at" TIMESTAMP(6) DEFAULT now(),

  CONSTRAINT "notificacion_lecturas_pkey" PRIMARY KEY ("notificacion_id", "usuario_id"),
  CONSTRAINT "notificacion_lecturas_notificacion_id_fkey"
    FOREIGN KEY ("notificacion_id")
    REFERENCES "core"."notificaciones"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT "notificacion_lecturas_usuario_id_fkey"
    FOREIGN KEY ("usuario_id")
    REFERENCES "core"."usuarios"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "core"."notificacion_eliminadas" (
  "notificacion_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "eliminado_at" TIMESTAMP(6) DEFAULT now(),

  CONSTRAINT "notificacion_eliminadas_pkey" PRIMARY KEY ("notificacion_id", "usuario_id"),
  CONSTRAINT "notificacion_eliminadas_notificacion_id_fkey"
    FOREIGN KEY ("notificacion_id")
    REFERENCES "core"."notificaciones"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT "notificacion_eliminadas_usuario_id_fkey"
    FOREIGN KEY ("usuario_id")
    REFERENCES "core"."usuarios"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "core"."notificacion_inicio_usuario" (
  "usuario_id" INTEGER NOT NULL,
  "fecha_ingreso" TIMESTAMP(6) NOT NULL DEFAULT now(),

  CONSTRAINT "notificacion_inicio_usuario_pkey" PRIMARY KEY ("usuario_id"),
  CONSTRAINT "notificacion_inicio_usuario_usuario_id_fkey"
    FOREIGN KEY ("usuario_id")
    REFERENCES "core"."usuarios"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);
