const zod = require("zod")

const userIdSchema = zod.number()

const emailSchema = zod.string().email()

const couponIdSchmema = zod.number()

const usernameSchema = zod.string()

const passwordSchema = zod.string()//.min(8).max(20).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/)

const timeSchema = zod.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)

const dateSchema =  zod.string().regex(/^(202[4-9]|20[3-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)

const signinBody = zod.object({
    username: usernameSchema,
    password: passwordSchema,
})

const signupBody = zod.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
})

const otpBody = zod.object({
    username: usernameSchema,
    password: passwordSchema,
    otp: zod.number()
})

const createCouponBody = zod.object({
    id: userIdSchema,
    sellerPrice: zod.number(),
    description: zod.string(),
    platform: zod.string(),
    validityTime: timeSchema,
    validityDate: dateSchema,
    code: zod.string()
})

const addToCartBody = zod.object({
    id: userIdSchema,
    couponId: couponIdSchmema
})

const filterCouponBody = zod.object({
    platform: zod.string().optional(),
    filter: zod.string(),
    id: userIdSchema,
    priceRange: zod.number().optional()
})

const buyCouponBody = zod.object({
    id: userIdSchema,
    couponId: couponIdSchmema
})

const withdrawBody = zod.object({
    id: userIdSchema,
    amount: zod.number().min(0),
    publicKey: zod.string(),
    couponId: couponIdSchmema
})

module.exports = {
    signinBody,
    signupBody,
    otpBody,
    addToCartBody,
    buyCouponBody,
    createCouponBody,
    filterCouponBody,
    userIdSchema,
    withdrawBody
}