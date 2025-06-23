const express = require("express")
const jwt = require("jsonwebtoken")
const { transporter } = require("../transporter.js")
const { signinBody, otpBody, signupBody } = require("../zod/zod.js")
const { authMiddleware } = require("../middleware/authMiddleware")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const router = express.Router()

router.post("/signup", async (req, res) => {
    const result = signupBody.safeParse(req.body)
    if(!result.success) {
        return res.status(411).json({
            msg: "Incorrect input",
            result
        })
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            email: req.body.email
        }
    })
    if(existingUser) {
        return res.status(400).json({
            msg: "User already exsit"
        })
    }
    const { username, password, email, avatarId } = req.body
    const user = await prisma.user.create({
        data: {
            username: username,
            password: password,
            email: email
        }
    })
    const generateOtp = await prisma.otp.create({
        data: {
            userId: user.id,
            otp: Math.floor(100000 + Math.random() * 900000)
        }
    })
    await transporter.sendMail({
        from: 'yash.onlywork@gmail.com',
        to: email,
        replyTo: 'no-reply@yash.onlywork@gmail.com',
        subject: `OTP from Coupon Exchange`,
        html: `<b>OTP for verification is ${generateOtp.otp}</b>`
    })
    return res.send({
        msg: "user created",
        userId: user.id
    })
})

router.post("/signin", async (req, res) => {
    const result = signinBody.safeParse(req.body)
    if(!result.success) {
        return res.status(411).json({
            msg: "Incorrect input",
            result
        })
    }
    const { username, password} = req.body
    const existingUser = await prisma.user.findFirst({
        where: {
            username: username
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
    if (existingUser.password !== password) {
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET)
    return res.send({
        msg: "user created",
        token
    })
})

// can be done with db tnx
router.post("/otp", async (req, res) => {
    const result = otpBody.safeParse(req.body)
    if(!result.success){
        return res.status(411).json({
            msg: "Incorrect input",
            result
        })
    }
    const { username, password, otp} = req.body
    const existingUser = await prisma.user.findFirst({
        where: {
            username
        },
        include: {
            otp: true
        }
    })
    if (!existingUser) {
        return res.status(404).json({
            msg: "User does not exsit"
        })
    }
    if (existingUser.authenticated) {
        return res.status(400).json({
            msg: "User already verified"
        })
    }
    if (existingUser.password !== password) {
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }
    if (existingUser.otp.otp !== otp) {
        return res.status(411).json({
            msg: "Incorrect otp"
        })
    }
    await prisma.user.update({
        where: {
            username
        },
        data: {
            authenticated: true
        }
    })
    await prisma.wallet.create({
        data: {
            userId: existingUser.id
        }
    })
    await prisma.cart.create({
        data: {
            userId: existingUser.id,
        }
    })
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET)
    return res.send({
        token
    })
})

// not done
router.get("/forgotPassword", authMiddleware, async (req, res) => {
    const result = signinBody.safeParse(req.body)
    if(!result.success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    const existingUser = await prisma.user.findFirst({
        where: {
            email: req.body.email
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
    if (existingUser.email) {
        await transporter.sendMail({
            from: 'secratary.scifiinnovationclub@gmail.com',
            to: email,
            replyTo: 'no-reply@scifiinnovationclub.com',
            subject: `Password from CoupMart`,
            html: `<b>Password  is ${existingUser.password}</b>`
        })
        return res.send({
            msg: "password send to email"
        })
    }
})

module.exports = {
    authRouter: router
} 