/*
  Warnings:

  - You are about to drop the column `listed` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `receiverCouponId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `senderCouponId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionSig]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listingPrice` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerPrice` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Made the column `listingTime` on table `Coupon` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `couponId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recieverId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recieverPublicKey` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPublicKey` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionSig` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_receiverCouponId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_senderCouponId_fkey";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "listed",
ADD COLUMN     "listingPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "sellerPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "sellingTime" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "listingTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "receiverCouponId",
DROP COLUMN "receiverId",
DROP COLUMN "senderCouponId",
DROP COLUMN "status",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "couponId" INTEGER NOT NULL,
ADD COLUMN     "recieverId" INTEGER NOT NULL,
ADD COLUMN     "recieverPublicKey" TEXT NOT NULL,
ADD COLUMN     "senderPublicKey" TEXT NOT NULL,
ADD COLUMN     "transactionSig" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "creditPoint" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLogs" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CreditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "couponId" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionSig_key" ON "Transaction"("transactionSig");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recieverId_fkey" FOREIGN KEY ("recieverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLogs" ADD CONSTRAINT "CreditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
