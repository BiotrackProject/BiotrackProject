-- Enable uuid-ossp extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "accion_permiso" AS ENUM ('Leer', 'Crear', 'Editar', 'Eliminar_Logico', 'Exportar', 'Publicar', 'Configurar');

-- CreateEnum
CREATE TYPE "categoria_ecosistema" AS ENUM ('Rio', 'Playa', 'Zona_Costera', 'Area_Protegida', 'Otro');

-- CreateEnum
CREATE TYPE "estado_accion" AS ENUM ('Planificada', 'En_Ejecucion', 'Completada', 'Cancelada');

-- CreateEnum
CREATE TYPE "estado_denuncia" AS ENUM ('Pendiente', 'En_Investigacion', 'Verificada', 'Resuelta', 'Desestimada');

-- CreateEnum
CREATE TYPE "estado_monitoreo" AS ENUM ('En_Proceso', 'Completado', 'Cancelado');

-- CreateEnum
CREATE TYPE "estado_punto" AS ENUM ('Activo', 'Inactivo', 'Mantenimiento');

-- CreateEnum
CREATE TYPE "estado_reporte" AS ENUM ('Borrador', 'Publicado', 'Archivado');

-- CreateEnum
CREATE TYPE "estado_solicitud" AS ENUM ('Pendiente_Aprobacion', 'Aprobada', 'Rechazada', 'Pendiente_Info');

-- CreateEnum
CREATE TYPE "estado_usuario" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "estado_zona" AS ENUM ('Activa', 'Inactiva');

-- CreateEnum
CREATE TYPE "nivel_riesgo" AS ENUM ('Bajo', 'Medio', 'Alto', 'Critico');

-- CreateEnum
CREATE TYPE "resultado_auditoria" AS ENUM ('Exito', 'Fallo');

-- CreateEnum
CREATE TYPE "tipo_actividad_ilegal" AS ENUM ('Extraccion_Rio', 'Extraccion_Playa', 'Extraccion_Zona_Protegida', 'Transporte_Ilegal', 'Otro');

-- CreateEnum
CREATE TYPE "tipo_archivo" AS ENUM ('Imagen', 'Documento', 'Video', 'Audio');

-- CreateEnum
CREATE TYPE "tipo_monitoreo" AS ENUM ('Automatico', 'Manual', 'Mixto');

-- CreateEnum
CREATE TYPE "tipo_reporte" AS ENUM ('Denuncias', 'Monitoreos', 'Acciones', 'Consolidado');

-- CreateEnum
CREATE TYPE "tipo_sensor" AS ENUM ('Turbidez', 'Temperatura', 'Movimiento', 'Nivel_Agua', 'Audio', 'GPS_Tracker', 'Otro');

-- CreateEnum
CREATE TYPE "visibilidad_accion" AS ENUM ('Publico', 'Restringido');

-- CreateTable
CREATE TABLE "Accion_Correctiva" (
    "IDAccion" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "responsable_id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion_accion" TEXT,
    "FechaPlanificacion" DATE,
    "FechaImplementacion" DATE,
    "Estado" "estado_accion" NOT NULL DEFAULT 'Planificada',
    "resumen_publico" VARCHAR(500),
    "visibilidad" "visibilidad_accion" NOT NULL DEFAULT 'Restringido',
    "Resultado" TEXT,
    "Presupuesto" DECIMAL(12,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accion_Correctiva_pkey" PRIMARY KEY ("IDAccion")
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "IDDenuncia" SERIAL NOT NULL,
    "codigo_seguimiento" VARCHAR(8) NOT NULL,
    "IDUsuario" UUID,
    "IDZona" UUID,
    "Descripcion" TEXT NOT NULL,
    "tipo_actividad" "tipo_actividad_ilegal" NOT NULL,
    "Fecha_denuncia" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_aproximada" TIME(6),
    "Estado" "estado_denuncia" NOT NULL DEFAULT 'Pendiente',
    "contacto_cifrado" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("IDDenuncia")
);

-- CreateTable
CREATE TABLE "Evidencia_Accion" (
    "IDEvidencia" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDAccion" UUID NOT NULL,
    "archivo_url" VARCHAR(500) NOT NULL,
    "TipoArchivo" "tipo_archivo" NOT NULL,
    "tamano_bytes" INTEGER,
    "hash_archivo" CHAR(64),
    "fecha_carga" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidencia_Accion_pkey" PRIMARY KEY ("IDEvidencia")
);

-- CreateTable
CREATE TABLE "Evidencia_Denuncia" (
    "IDEvidencia" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDDenuncia" INTEGER NOT NULL,
    "archivo_url" VARCHAR(500) NOT NULL,
    "TipoArchivo" "tipo_archivo" NOT NULL,
    "tamano_bytes" INTEGER,
    "hash_archivo" CHAR(64),
    "fecha_carga" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSON,

    CONSTRAINT "Evidencia_Denuncia_pkey" PRIMARY KEY ("IDEvidencia")
);

-- CreateTable
CREATE TABLE "Monitoreo" (
    "IDMonitoreo" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDPunto" UUID NOT NULL,
    "IDUsuario" UUID NOT NULL,
    "Fecha_inicio" TIMESTAMP(6) NOT NULL,
    "Fecha_fin" TIMESTAMP(6),
    "Tipo_monitoreo" "tipo_monitoreo" NOT NULL,
    "Estado" "estado_monitoreo" NOT NULL DEFAULT 'En_Proceso',

    CONSTRAINT "Monitoreo_pkey" PRIMARY KEY ("IDMonitoreo")
);

-- CreateTable
CREATE TABLE "Municipios" (
    "IDMunicipio" SERIAL NOT NULL,
    "IDProvincia" INTEGER NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "Municipios_pkey" PRIMARY KEY ("IDMunicipio")
);

-- CreateTable
CREATE TABLE "Provincias" (
    "IDProvincia" SERIAL NOT NULL,
    "Nombre" VARCHAR(50) NOT NULL,
    "Region" VARCHAR(50),

    CONSTRAINT "Provincias_pkey" PRIMARY KEY ("IDProvincia")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "IDReporte" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "generado_por" UUID NOT NULL,
    "TipoReporte" "tipo_reporte" NOT NULL,
    "periodo_inicio" DATE,
    "periodo_fin" DATE,
    "filtros_usados" JSON,
    "Estado" "estado_reporte" NOT NULL DEFAULT 'Borrador',
    "archivo_url" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("IDReporte")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "IDUsuario" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre_completo" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "contrasena_hash" VARCHAR(72) NOT NULL,
    "rol_id" UUID NOT NULL,
    "Estado" "estado_usuario" NOT NULL DEFAULT 'Activo',
    "cargo" VARCHAR(80),
    "institucion" VARCHAR(100),
    "telefono" VARCHAR(20),
    "Fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Ultimo_acceso" TIMESTAMP(6),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("IDUsuario")
);

-- CreateTable
CREATE TABLE "accion_denuncia" (
    "IDAccion" UUID NOT NULL,
    "IDDenuncia" INTEGER NOT NULL,

    CONSTRAINT "accion_denuncia_pkey" PRIMARY KEY ("IDAccion","IDDenuncia")
);

-- CreateTable
CREATE TABLE "accion_zona" (
    "IDAccion" UUID NOT NULL,
    "IDZona" UUID NOT NULL,

    CONSTRAINT "accion_zona_pkey" PRIMARY KEY ("IDAccion","IDZona")
);

-- CreateTable
CREATE TABLE "historial_estado_denuncia" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDDenuncia" INTEGER NOT NULL,
    "IDUsuario" UUID NOT NULL,
    "estado_anterior" "estado_denuncia" NOT NULL,
    "estado_nuevo" "estado_denuncia" NOT NULL,
    "comentario" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_denuncia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_riesgo_zona" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "IDZona" UUID NOT NULL,
    "IDUsuario" UUID NOT NULL,
    "nivel_anterior" "nivel_riesgo" NOT NULL,
    "nivel_nuevo" "nivel_riesgo" NOT NULL,
    "justificacion" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_riesgo_zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "accion" VARCHAR(100) NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45),
    "resultado" "resultado_auditoria" NOT NULL,
    "detalle" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "modulo" VARCHAR(50) NOT NULL,
    "accion" "accion_permiso" NOT NULL,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "solicitud_registro" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre_completo" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "cargo" VARCHAR(80),
    "institucion" VARCHAR(100),
    "estado" "estado_solicitud" NOT NULL DEFAULT 'Pendiente_Aprobacion',
    "revisado_por" UUID,
    "comentario_admin" VARCHAR(300),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_registro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Denuncia_codigo_seguimiento_key" ON "Denuncia"("codigo_seguimiento");

-- CreateIndex
CREATE INDEX "idx_denuncia_codigo" ON "Denuncia"("codigo_seguimiento");

-- CreateIndex
CREATE INDEX "idx_denuncia_estado" ON "Denuncia"("Estado");

-- CreateIndex
CREATE INDEX "idx_denuncia_usuario" ON "Denuncia"("IDUsuario");

-- CreateIndex
CREATE INDEX "idx_denuncia_zona" ON "Denuncia"("IDZona");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_electronico_key" ON "Usuario"("correo_electronico");

-- CreateIndex
CREATE INDEX "idx_log_auditoria_created_at" ON "log_auditoria"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_log_auditoria_modulo" ON "log_auditoria"("modulo");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_modulo_accion_key" ON "permiso"("modulo", "accion");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- AddForeignKey
ALTER TABLE "Accion_Correctiva" ADD CONSTRAINT "Accion_Correctiva_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Evidencia_Accion" ADD CONSTRAINT "Evidencia_Accion_IDAccion_fkey" FOREIGN KEY ("IDAccion") REFERENCES "Accion_Correctiva"("IDAccion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Evidencia_Denuncia" ADD CONSTRAINT "Evidencia_Denuncia_IDDenuncia_fkey" FOREIGN KEY ("IDDenuncia") REFERENCES "Denuncia"("IDDenuncia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Monitoreo" ADD CONSTRAINT "Monitoreo_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Municipios" ADD CONSTRAINT "Municipios_IDProvincia_fkey" FOREIGN KEY ("IDProvincia") REFERENCES "Provincias"("IDProvincia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_generado_por_fkey" FOREIGN KEY ("generado_por") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accion_denuncia" ADD CONSTRAINT "accion_denuncia_IDAccion_fkey" FOREIGN KEY ("IDAccion") REFERENCES "Accion_Correctiva"("IDAccion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accion_denuncia" ADD CONSTRAINT "accion_denuncia_IDDenuncia_fkey" FOREIGN KEY ("IDDenuncia") REFERENCES "Denuncia"("IDDenuncia") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accion_zona" ADD CONSTRAINT "accion_zona_IDAccion_fkey" FOREIGN KEY ("IDAccion") REFERENCES "Accion_Correctiva"("IDAccion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_estado_denuncia" ADD CONSTRAINT "historial_estado_denuncia_IDDenuncia_fkey" FOREIGN KEY ("IDDenuncia") REFERENCES "Denuncia"("IDDenuncia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_estado_denuncia" ADD CONSTRAINT "historial_estado_denuncia_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_riesgo_zona" ADD CONSTRAINT "historial_riesgo_zona_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permiso"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitud_registro" ADD CONSTRAINT "solicitud_registro_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "Usuario"("IDUsuario") ON DELETE NO ACTION ON UPDATE NO ACTION;
