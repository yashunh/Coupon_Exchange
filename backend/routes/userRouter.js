const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authMiddleware } = require("../middleware/authMiddleware")
const { userIdSchema } = require("../zod/zod")
const { userMiddleware } = require("../middleware/userMiddleware")

const router = express.Router()
const prisma = new PrismaClient()

// need change
router.get("/getProfile", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
    res.send({existingUser})
})

// can add iterator
router.get("/getNotification", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getCart",authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getBalance",authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getCredit",authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getTransactionHistory", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getCreditsHistory", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

router.get("/getBoughtCouponsHistory", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware , async(req,res)=>{
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

module.exports = {
    userRouter: router
}