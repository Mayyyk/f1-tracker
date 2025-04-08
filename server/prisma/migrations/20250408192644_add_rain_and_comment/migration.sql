/*
  Warnings:

  - You are about to drop the column `isNightRace` on the `Race` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Race" DROP COLUMN "isNightRace",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "wasRain" BOOLEAN NOT NULL DEFAULT false;
