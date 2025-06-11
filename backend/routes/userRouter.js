import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware"
import { changeAvatarBody, userIdSchema } from "../zod/zod"
import { userMiddleware } from "../middleware/userMiddleware"
import { bodyMiddleware } from "../middleware/bodyMiddleware"

const router = express.Router()
const prisma = new PrismaClient()


router.put("/changeAvatar", authMiddleware, bodyMiddleware(changeAvatarBody), userMiddleware , async(req, res)=>{
    const result = await prisma.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            avatarId: req.body.avatarId
        }
    })
    if(!result){
        return res.status(404).json({
            msg: "error"
        })
    }
    res.send({
        msg: "avatar updated"
    })
})

// need change
router.get("/getProfile", authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    res.send({existingUser})
})

// can add iterator
router.get("/getNotification", authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.notification.findMany({
        orderBy: {
            dateTime: "desc"
        },
        where: {
            userId: existingUser.id
        }
    })
    res.send({result})
})

router.get("/getCart",authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.cart.findMany({
        orderBy: {
            dateTime: "desc"
        },
        where: {
            userId: existingUser.id
        }
    })
    res.send({result})
})

router.get("/getBalance",authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.wallet.findMany({
        where: {
            userId: existingUser.id
        },
        select: {
            balance: true
        }
    })
    res.send({result})
})

router.get("/getCredit",authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.wallet.findMany({
        where: {
            userId: existingUser.id
        },
        select: {
            creditPoint: true
        }
    })
    res.send({result})
})

router.get("/getTransactionHistory", authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.transaction.findMany({
        orderBy:{
            dateTime: 'desc'
        },
        where:{
            OR: [
                {
                    senderId: req.body.id
                },
                {
                    recieverId: req.body.id
                }
            ]
        }
    })
    res.send(result)
})

router.get("/getCreditsHistory", authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.creditLogs.findMany({
        orderBy:{
            dateTime: 'desc'
        },
        where:{
            userId: req.body.id
        }
    })
    res.send(result)
})

router.get("/getBoughtCouponsHistory", authMiddleware, bodyMiddleware(userIdSchema), userMiddleware , async(req,res)=>{
    const result = await prisma.coupon.findMany({
        orderBy:{
            sellingTime: 'desc'
        },
        where:{
            seller: req.body.id
        }
    })
    res.send(result)
})

export default userRouter = router