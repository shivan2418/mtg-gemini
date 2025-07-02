/*
  Warnings:

  - You are about to drop the `MtgSet` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[scryfallId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scryfallId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "scryfallId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MtgSet";

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfallId_key" ON "Card"("scryfallId");
