const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { addToCartBody, buyCouponBody, createCouponBody, filterCouponBody, userIdSchema } = require("../zod/zod")
const { userMiddleware } = require("../middleware/userMiddleware")
const prisma = require("../index.js")

const router = express.Router()

router.post("/create", authMiddleware, (req,res,next)=>{
     const { success } = createCouponBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
    const { id, sellerPrice, description, platform, validityTime, validityDate, code} = req.body
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
            ownerId: id,
            listingPrice: sellerPrice*1.01,
            sellingPrice: sellerPrice,
            validity: dateTime,
            platform: platform,
            description: description,
            code: code
        }
    })
    res.send(result)
})

router.get("/latest", authMiddleware,  (req,res,next)=>{
    const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
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

router.get("/myListing", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
    const result = await prisma.coupon.findMany({
        where: {
            ownerId: req.body.id
        }
    })
    res.send(result)
})

router.post("/addToCart",  authMiddleware,  (req,res,next)=>{
     const { success } = addToCartBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
    const cart = await prisma.cart.findFirst({
        where: {
            userId: req.body.id
       
        }
    })
    let result;
    if(!cart){
        result = await prisma.cart.create({
            data: {
                userId: req.body.id,
                items: [couponId]
            }
        })
    }
    else{
       result = await prisma.cart.update({
            where: {
                id: cart.id
            },
            data:{
                ...cart,
                items: [...cart.items, couponId]
            }
       })
    }
    res.send(result)
})

router.get("/:id", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
    const result = await prisma.coupon.findUnique({
        where:{
            id: req.params.id
        }
    })
    res.send(result)
})

//verify
router.get("/filter", authMiddleware,  (req,res,next)=>{
     const { success } = userIdSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}, userMiddleware, async (req, res)=>{
    const result = await prisma.coupon.findMany({
        take: 50,
        where:{
            sold: false,
            verified: true,
            platform: req.body.platform || "",
            description: {
                contains: req.body.filter
            },
            sellerPrice :{
                lessThanOrEqualTo: req.body.priceRange
            }
        },
        orderBy: {
            listingTime: 'desc'
        }
    })
    res.send(result)
})

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

module.exports = {
    couponRouter: router
}