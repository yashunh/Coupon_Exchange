const express = require("express")
const { couponRouter } = require("./routes/couponRouter")
const { userRouter } = require("./routes/userRouter")
const { authRouter } = require("./routes/authRouter.js")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const app = express()
app.use(express.json())

//multiple prisma client
// wallet and transaction
app.use("/coupon",couponRouter)
app.use("/user",userRouter)
app.use("/auth",authRouter)
app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({error:err})
})

app.listen(3000, ()=>{
    console.log("server at 3000")
})

module.exports = {
    app,
    prisma
}