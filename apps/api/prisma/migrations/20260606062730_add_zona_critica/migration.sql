-- CreateTable
CREATE TABLE "Zona_Critica" (
    "IDZona" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDMunicipio" BIGINT NOT NULL,
    "responsable_tecnico" UUID,
    "NombreZona" VARCHAR(150)[],
    "Geometria" polygon[],
    "NivelDeRiesgo" "nivel_riesgo" NOT NULL DEFAULT 'Bajo',
    "categoria_ecosistema" "categoria_ecosistema"[],
    "Estado" "estado_zona" NOT NULL DEFAULT 'Activa',
    "area_m2" INTEGER,
    "api_key_hash" VARCHAR(64)[],
    "fecha_identificacion" DATE,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zona_Critica_pkey" PRIMARY KEY ("IDZona")
);
