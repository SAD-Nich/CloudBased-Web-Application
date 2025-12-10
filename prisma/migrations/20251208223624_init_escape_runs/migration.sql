-- CreateTable
CREATE TABLE "EscapeRun" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "durationSeconds" INTEGER NOT NULL,
    "stages" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EscapeRun_scenarioId_idx" ON "EscapeRun"("scenarioId");

-- CreateIndex
CREATE INDEX "EscapeRun_createdAt_idx" ON "EscapeRun"("createdAt");
