-- AlterTable
ALTER TABLE "Denuncia" ADD COLUMN     "cantidad_arena" VARCHAR(150),
ADD COLUMN     "detalle_ubicacion" TEXT,
ADD COLUMN     "fecha_incidente" DATE,
ADD COLUMN     "municipio" VARCHAR(100),
ADD COLUMN     "nivel_urgencia" VARCHAR(30),
ADD COLUMN     "numero_personas" VARCHAR(50),
ADD COLUMN     "provincia" VARCHAR(100),
ADD COLUMN     "sector" VARCHAR(150),
ADD COLUMN     "tipo_extraccion" VARCHAR(50),
ADD COLUMN     "ubicacion_gps" point;
