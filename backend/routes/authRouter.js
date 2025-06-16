const express = require("express")
const jwt = require("jsonwebtoken")
const { transporter } = require("../transporter.js")
const { signinBody, otpBody, signupBody } = require("../zod/zod.js")
const { PrismaClient } = require("@prisma/client")
const { authMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()

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

router.get("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
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
    if (existingUser.password !== req.body.password) {
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

router.put("/otp", async (req, res) => {
    const { success } = otpBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            number: req.body.number
        },
        include: {
            otp: true
        }
    })
    console.log(existingUser)
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
    const getOtp = await prisma.otp.findFirst({
        where: {
            userId: existingUser.id
        }
    })
    if (getOtp.otp !== req.body.otp) {
        return res.status(411).json({
            msg: "Incorrect otp"
        })
    }
    await prisma.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            authenticated: true
        }
    })
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET)
    return res.send({
        token
    })
})

// not done
router.get("/forgotPassword", authMiddleware, async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
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