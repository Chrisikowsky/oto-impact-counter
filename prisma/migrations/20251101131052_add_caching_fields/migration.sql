-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cachedScanCount" INTEGER,
ADD COLUMN     "scansLastCheckedAt" TIMESTAMP(3);
