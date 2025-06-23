const express = require("express")
const { couponRouter } = require("./routes/couponRouter")
const { userRouter } = require("./routes/userRouter")
const { authRouter } = require("./routes/authRouter.js")
const { transactionRouter } = require("./routes/transactionRouter.js")
const app = express()
app.use(express.json())

app.use("/coupon",couponRouter)
app.use("/user",userRouter)
app.use("/auth",authRouter)
app.use("/tnx", transactionRouter)

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({error:err})
})

app.listen(3000, ()=>{
    console.log("server at 3000")
})

module.exports = app