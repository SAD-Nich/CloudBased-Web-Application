-- AlterTable
ALTER TABLE "EscapeRun" ADD COLUMN     "runName" TEXT;

-- CreateIndex
CREATE INDEX "EscapeRun_runName_idx" ON "EscapeRun"("runName");
