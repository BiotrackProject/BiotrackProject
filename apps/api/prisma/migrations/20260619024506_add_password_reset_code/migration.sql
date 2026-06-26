-- CreateTable
CREATE TABLE "password_reset_code" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "usuario_id" UUID NOT NULL,
    "codigo_hash" VARCHAR(64) NOT NULL,
    "expira_en" TIMESTAMP(6) NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_code_usuario_id_idx" ON "password_reset_code"("usuario_id");

-- CreateIndex
CREATE INDEX "password_reset_code_created_at_idx" ON "password_reset_code"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "password_reset_code" ADD CONSTRAINT "password_reset_code_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("IDUsuario") ON DELETE CASCADE ON UPDATE NO ACTION;
