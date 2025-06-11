export const bodyMiddleware = async(req, res, next, bodySchema)=>{
    const { success } = bodySchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect input"
        })
    }
    next()
}