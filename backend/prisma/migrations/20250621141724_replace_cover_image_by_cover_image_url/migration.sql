/*
  Warnings:

  - You are about to drop the column `coverImageId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_coverImageId_fkey";

-- DropIndex
DROP INDEX "Course_coverImageId_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "coverImageId",
ADD COLUMN     "coverImageUrl" TEXT;
