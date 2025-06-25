const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { userIdSchema } = require("../zod/zod")
const { userMiddleware } = require("../middleware/userMiddleware")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const router = express.Router()

router.get("/getProfile", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    console.log(req.params)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input",
            result
        })
    }
    next()
}, async (req, res) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: req.params.id
        },
        omit: {
            password: true
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            msg: "User does not exsit"
        })
    }
    if (!existingUser.authenticated) {
        return res.status(411).json({
            msg: "User not verified"
        })
    }
    res.send(existingUser)
})

// can add iterator
router.get("/getNotification", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.notification.findMany({
        orderBy: {
            dateTime: "desc"
        },
        where: {
            userId: req.params.id
        }
    })
    res.send(result)
})

router.get("/getCart", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.cart.findFirst({
        where: {
            userId: req.params.id
        },
        include: {
            items: {
                orderBy: {
                    addedAT: "desc"
                }
            }
        }
    })
    res.send(result)
})

router.get("/getBalance", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.wallet.findFirst({
        where: {
            userId: req.params.id
        }
    })
    res.send(result)
})

router.get("/getTransactionHistory", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.transaction.findMany({
        orderBy: {
            dateTime: 'desc'
        },
        where: {
            OR: [
                {
                    senderId: req.params.id
                },
                {
                    recieverId: req.params.id
                }
            ]
        }
    })
    res.send(result)
})

router.get("/getCreditsHistory", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.creditLogs.findMany({
        orderBy: {
            dateTime: 'desc'
        },
        where: {
            userId: req.params.id
        }
    })
    res.send(result)
})

router.get("/getBoughtCouponsHistory", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.transaction.findMany({
        orderBy: {
            dateTime: 'desc'
        },
        where: {
            senderId: req.params.id
        },
        select: {
            amount: true,
            dateTime: true,
            coupon: {
                include: true
            }
        }
    })
    res.send(result)
})

router.get("/getSoldCouponsHistory", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await await prisma.transaction.findMany({
        orderBy: {
            dateTime: 'desc'
        },
        where: {
            recieverId: req.params.id
        }
    })
    res.send(result)
})

module.exports = {
    userRouter: router
}