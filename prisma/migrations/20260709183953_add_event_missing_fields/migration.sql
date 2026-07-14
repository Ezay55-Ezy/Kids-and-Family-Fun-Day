-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "registrationCloseDate" TIMESTAMP(3),
ADD COLUMN     "registrationOpenDate" TIMESTAMP(3),
ADD COLUMN     "shortDescription" TEXT,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
