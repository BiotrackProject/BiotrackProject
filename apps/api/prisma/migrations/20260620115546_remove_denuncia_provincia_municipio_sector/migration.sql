/*
  Warnings:

  - You are about to drop the column `municipio` on the `Denuncia` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `Denuncia` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `Denuncia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Denuncia" DROP COLUMN "municipio",
DROP COLUMN "provincia",
DROP COLUMN "sector";
