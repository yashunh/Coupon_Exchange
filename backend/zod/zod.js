import zod from "zod"

export const userIdSchema = zod.number()

export const emailSchema = zod.string().email()

export const couponIdSchmema = zod.number()

export const passwordSchema = zod.string().min(8).max(20).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/)

export const timeSchema = zod.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)

export const dateSchema =  zod.string().regex(/^(202[4-9]|20[3-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)

export const signinBody = zod.object({
    username: usernameSchema,
    password: passwordSchema
})

export const signupBody = zod.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    avatarId: zod.number()
})

export const otpBody = zod.object({
    id: userIdSchema,
    otp: zod.string().min(6).max(6).regex(/[0-9]/)
})

export const changeAvatarBody = zod.object({
    id: userIdSchema,
    avatarId: zod.number()
})

export const createCouponBody = zod.object({
    id: userIdSchema,
    sellerPrice: zod.number(),
    description: zod.string(),
    platform: zod.string(),
    validityTime: timeSchema,
    validityDate: dateSchema,
    code: zod.string()
})

export const addToCartBody = zod.object({
    id: userIdSchema,
    couponId: couponIdSchmema
})

export const filterCouponBody = zod.object({
    platform: zod.string().optional(),
    filter: zod.string(),
    id: userIdSchema,
    priceRange: zod.number().optional()
})

export const buyCouponBody = zod.object({
    id: userIdSchema,
    couponId: couponIdSchmema
})