-- DropIndex
DROP INDEX "Card_name_trgm_idx";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "formatId" TEXT;
