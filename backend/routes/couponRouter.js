const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { createCouponBody, filterCouponBody, userIdSchema, couponIdSchmema } = require("../zod/zod")
const { userMiddleware } = require("../middleware/userMiddleware")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const router = express.Router()

router.post("/create", authMiddleware, (req, res, next) => {
    const result = createCouponBody.safeParse(req.body)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const { sellingPrice, description, platform, validityTime, validityDate, code } = req.body
    const today = new Date()
    today.setUTCHours(today.getUTCHours() - 5, today.getUTCMinutes() - 30)
    const [hours, minutes] = validityTime.split(':')
    const [year, month, day] = validityDate.split('-')
    let dateTime = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10)
    );
    const result = await prisma.coupon.create({
        data: {
            ownerId: req.params.id,
            listingPrice: sellingPrice * 1.01,
            sellingPrice: sellingPrice,
            validity: dateTime,
            platform: platform,
            description: description,
            code: code
        }
    })
    res.send(result)
})

router.get("/latest", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.coupon.findMany({
        orderBy: {
            listingTime: "desc"
        },
        take: 30,
        where: {
            sold: false,
            verified: true
        }
    })
    res.send(result)
})

router.get("/myListing", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.params.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.coupon.findMany({
        where: {
            ownerId: req.params.id
        }
    })
    res.send(result)
})

router.post("/addToCart", authMiddleware, (req, res, next) => {
    const result = couponIdSchmema.safeParse(req.body)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const cart = await prisma.cart.findFirst({
        where: {
            userId: req.params.id
        }
    })
    let result = await prisma.cart.update({
        where: {
            id: cart.id
        },
        data: {
            items: [...cart.items, couponId]
        }
    })
    return res.send(result)
})

router.get("/:id", authMiddleware, (req, res, next) => {
    const result = couponIdSchmema.safeParse(req.body.id)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.coupon.findUnique({
        where: {
            id: req.body.id
        }
    })
    res.send(result)
})

//verify / not done
router.get("/filter", authMiddleware, (req, res, next) => {
    const result = userIdSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res) => {
    const result = await prisma.coupon.findMany({
        take: 50,
        where: {
            sold: false,
            verified: true,
            platform: req.body.platform || "",
            description: {
                contains: req.body.filter
            },
            sellerPrice: {
                lessThanOrEqualTo: req.body.priceRange
            }
        },
        orderBy: {
            listingTime: 'desc'
        }
    })
    res.send(result)
})

module.exports = {
    couponRouter: router
}