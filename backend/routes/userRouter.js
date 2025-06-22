const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { userIdSchema } = require("../zod/zod")
const { userMiddleware } = require("../middleware/userMiddleware")
const prisma = require("../index.js")

const router = express.Router()

router.get("/getProfile", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, async (req, res) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: req.body.id
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
    res.send({ existingUser })
})

// can add iterator
router.get("/getNotification", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
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
            userId: existingUser.id
        }
    })
    res.send({ result })
})

router.get("/getCart", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.cart.findMany({
        orderBy: {
            dateTime: "desc"
        },
        where: {
            userId: req.body.id
        }
    })
    res.send({ result })
})

router.get("/getBalance", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.wallet.findMany({
        where: {
            userId: req.body.id
        }
    })
    res.send({ result })
})

router.get("/getTransactionHistory", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
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
                    senderId: req.body.id
                },
                {
                    recieverId: req.body.id
                }
            ]
        }
    })
    res.send({result})
})

router.get("/getCreditsHistory", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
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
            userId: req.body.id
        }
    })
    res.send(result)
})

router.get("/getBoughtCouponsHistory", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
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
            senderId: req.body.id
        },
        select: {
            amount: true,
            dateTime: true,
            coupon: {
                include: true
            }
        }
    })
    res.send({result})
})

router.get("/getSoldCouponsHistory", authMiddleware, (req, res, next) => {
    const { success } = userIdSchema.safeParse(req.body)
    if (!success) {
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
            recieverId: req.body.id
        }
    })
    res.send({result})
})

module.exports = {
    userRouter: router
}