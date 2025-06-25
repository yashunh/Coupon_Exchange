const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next)=>{
    const headers = req.headers.authorization
    if(!headers || !headers.startsWith('Bearer')){
        return res.status(403).json({
            msg: "Invalid headers"
        })
    }
    const token = headers.split(' ')[1]
    try{
        const result = jwt.verify(token, process.env.JWT_SECRET)
        req.params.id = result.id
        next()
    }catch(err){
        console.log(err)
        return res.status(403).json({
            error: err
        })
    }
}

module.exports = {
    authMiddleware
}