const prisma = require("../index.js")

const userMiddleware = async(req, res, next)=>{
    const existingUser = await prisma.user.findUnique({
        where:{
            id: req.body.id
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
    next()
}

module.exports = {
    userMiddleware
}