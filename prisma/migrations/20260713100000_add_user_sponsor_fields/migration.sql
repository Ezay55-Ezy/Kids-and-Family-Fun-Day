-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);

-- AlterTable: Sponsor
ALTER TABLE "Sponsor" ADD COLUMN "slug" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "description" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Sponsor" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Sponsor" ALTER COLUMN "userId" DROP NOT NULL;

-- Populate slug for existing sponsors (slugified companyName)
UPDATE "Sponsor" SET "slug" = LOWER(REPLACE("companyName", ' ', '-')) WHERE "slug" IS NULL;

-- Now make slug NOT NULL
ALTER TABLE "Sponsor" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_slug_key" ON "Sponsor"("slug");
CREATE INDEX "Sponsor_isPublished_idx" ON "Sponsor"("isPublished");
CREATE INDEX "Sponsor_displayOrder_idx" ON "Sponsor"("displayOrder");
