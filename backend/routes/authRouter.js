import express from "express"
import jwt from "jsonwebtoken"
import { transporter } from "../transporter.js"
import { signinBody, otpBody, signupBody} from "../zod/zod.js"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/signup", async (req, res)=>{
    const { success } = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }

    const existingUser = await prisma.user.findFirst({
        where:{
            email: req.body.email
        }
    })
    if(existingUser){
        return res.status(411).json({
            msg: "User already exsit"
        })
    }
    const { username, password, email, avatarId } = req.body
    const user = await prisma.user.create({
        data: {
            username: username,
            password: password,
            email: email,
            avatarId: avatarId
        }
    })
    const generateOtp = await prisma.otp.create({
        data: {
            userId: user.id,
            otp: Math.floor(100000 + Math.random()*900000)
        }
    })
    await transporter.sendMail({
        from: 'secratary.scifiinnovationclub@gmail.com',
        to: email,
        replyTo: 'no-reply@scifiinnovationclub.com',
        subject: `OTP from CoupMart`,
        html: `<b>OTP for verification is ${generateOtp.otp}</b>`
    })
    return res.send({
        msg: "user created",
        user
    })
})

router.get("/signin", async (req, res)=>{
    const { success } = signinBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    const existingUser = await prisma.user.findFirst({
        where:{
            email: req.body.email
        }
    })
    if(!existingUser){
        return res.status(411).json({
            msg: "User does not exsit"
        })
    }
    if(!existingUser.authenticated){
        return res.status(411).json({
            msg: "User not verified"
        })
    }
    if(existingUser.password !== req.body.password){
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }
    const token = jwt.sign({id: existingUser.id},process.env.JWT_SECRET)
    return res.send({
        token
    })
})

router.put("/otp", async (req, res)=>{
    const { success } = otpBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }

    const existingUser = await prisma.user.findFirst({
        where:{
            number: req.body.number
        }
    })
    if(!existingUser){
        return res.status(411).json({
            msg: "User does not exsit"
        })
    } 
    if(existingUser.authenticated){
        return res.status(411).json({
            msg: "User already verified"
        })
    } 
    const getOtp = await prisma.otp.findFirst({
        where: {
            userId: existingUser.id
        }
    })
    if(getOtp.otp !== req.body.otp){
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
    const token = jwt.sign({id: existingUser.id},process.env.JWT_SECRET)
    return res.send({
        token
    })
})

// not done
router.get("/forgotPassword", authMiddleware, async(req, res)=>{
    const { success } = signinBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    const existingUser = await prisma.user.findFirst({
        where:{
            email: req.body.email
        }
    })
    if(!existingUser){
        return res.status(411).json({
            msg: "User does not exsit"
        })
    }
    if(!existingUser.authenticated){
        return res.status(411).json({
            msg: "User not verified"
        })
    }
    if(existingUser.email){
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

export default authRouter = router