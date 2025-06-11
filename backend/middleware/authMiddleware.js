import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next)=>{
    const headers = req.headers.authorization
    if(!headers || headers.startsWith('Bearer')){
        return res.status(403).json({
            msg: "Invalid headers"
        })
    }
    const token = headers.split(' ')[1]
    try{
        const id = jwt.verify(token, process.env.JWT_SECRET)
        req.body.id = id
        next()
    }catch(err){
        return res.status(403).json({
            error: err
        })
    }
}