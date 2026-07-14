-- Add viewCount column with default 0
ALTER TABLE "Service" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;