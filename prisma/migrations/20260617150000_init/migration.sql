CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "TaskStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'ARCHIVED');
CREATE TYPE "ImportStatus" AS ENUM ('VALIDATING', 'READY', 'COMPLETED', 'FAILED');

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "categoryId" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "conditionMarkdown" TEXT NOT NULL,
  "expressionLatex" TEXT NOT NULL,
  "answerMarkdown" TEXT NOT NULL,
  "solutionMarkdown" TEXT NOT NULL,
  "source" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'HIDDEN',
  "duplicateHash" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "purgeAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskImage" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "storedFileName" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImportBatch" (
  "id" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "status" "ImportStatus" NOT NULL DEFAULT 'VALIDATING',
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "importedRows" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "errorsJson" JSONB,
  "previewJson" JSONB,
  "tempDir" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");
CREATE UNIQUE INDEX "Task_number_key" ON "Task"("number");
CREATE INDEX "Task_categoryId_idx" ON "Task"("categoryId");
CREATE INDEX "Task_difficulty_idx" ON "Task"("difficulty");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_number_idx" ON "Task"("number");
CREATE INDEX "Task_duplicateHash_idx" ON "Task"("duplicateHash");
CREATE INDEX "TaskImage_taskId_idx" ON "TaskImage"("taskId");

ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaskImage" ADD CONSTRAINT "TaskImage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
