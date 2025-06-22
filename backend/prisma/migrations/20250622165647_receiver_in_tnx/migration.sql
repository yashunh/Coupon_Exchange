/*
  Warnings:

  - You are about to drop the column `sellerPrice` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `sellingPrice` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "sellerPrice",
ADD COLUMN     "sellingPrice" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "listingTime" SET DEFAULT CURRENT_TIMESTAMP;
