-- AlterTable: Gallery
ALTER TABLE "Gallery" ADD COLUMN "title" TEXT;
ALTER TABLE "Gallery" ADD COLUMN "description" TEXT;
ALTER TABLE "Gallery" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Gallery" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Gallery_isPublished_idx" ON "Gallery"("isPublished");
CREATE INDEX "Gallery_displayOrder_idx" ON "Gallery"("displayOrder");
