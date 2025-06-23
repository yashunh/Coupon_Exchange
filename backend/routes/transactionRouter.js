const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { withdrawBody, buyCouponBody } = require("../zod/zod.js")
const { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require("@solana/web3.js")
const bs58 = require("bs58")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const router = express.Router()
const connection = new Connection("https://api.devnet.solana.com")

//need change
router.post("/buy", authMiddleware, (req,res,next)=>{
     const { success } = buyCouponBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, async (req, res)=>{
    const today = new Date()
    today.setUTCHours(today.getUTCHours() - 5, today.getUTCMinutes() - 30)
    const coupon = await prisma.coupon.findFirst({
        where: {
            id: req.body.couponId
        }
    })
    if(!coupon){
        return res.status(404).json({
            msg: "invalid coupon id"
        })
    }
    if(coupon.sold){
        return res.status(404).json({
            msg: "coupon is already sold"
        })
    }
    if(!coupon.verified){
        return res.status(404).json({
            msg: "coupon not verified"
        })
    }
    const userWallet = await prisma.wallet.findFirst({
        where: {
            userId: req.body.id
        }
    })
    if(!userWallet){
        return res.status(404).json({
            msg: "invalid user id"
        })
    }
    if(userWallet.balance <= coupon.sellerPrice){
        return res.status(404).json({
            msg: "insufficient balance"
        })
    }
    await prisma.coupon.update({
        where: {
            id: req.body.couponId
        },
        data: {
            buyerId: req.body.id,
            sellingTime: today,
            sold: true
        }
    })
    await prisma.wallet.update({
        where: {
            id: userWallet.id
        },
        data: {
            balance: {
                decrement: coupon.sellerPrice
            }
        }
    })
    await prisma.wallet.updateMany({
        where: {
            userId: coupon.ownerId
        },
        data: {
            balance: {
                increment: coupon.listingPrice
            }
        }
    })
    return res.json({
        msg: "coupon bought successfully",
        couponId: coupon.id
    })
})

router.get("/withdraw", authMiddleware, (req,res,next)=>{
     const { success } = withdrawBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, async (req, res)=>{
    const { id, amount, publicKey,couponId} = req.body
    const wallet = await prisma.wallet.findFirst({
        where: {
            id: id
        }
    })
    
    if(wallet.balance < amount){
        return res.status(400).send({
            msg: "Insufficient balance",
            wallet
        })
    }

    const keypair = Keypair.fromSecretKey(bs58.decode(process.env.SOL_PRIVATE_KEY))
    const tnx = new Transaction()
    tnx.add(SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: publicKey,
        lamports: amount
    }))  
    tnx.sign(keypair)
    const sign = await sendAndConfirmTransaction(connection,tnx,[keypair])
    await prisma.transaction.create({
        data: {
            senderId: 0,
            recieverId: id,
            amount: amount,
            senderPublicKey: keypair.publicKey,
            recieverPublicKey: keypair.secretKey,
            transactionSig: sign,
            couponId,
        }
    })
})

module.exports = {
    transactionRouter: router
}