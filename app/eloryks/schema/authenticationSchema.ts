import { z } from "zod";

export const AuthenticationSchema = z.object({
    email: z
        .string({
            invalid_type_error: "CoordX must be a string",
            required_error: "Email is required"
        }).email(),
    pwd: z
        .string({
            invalid_type_error: "Password must be a string",
            required_error: "Password is required"
        })
})

export type AuthenticationData = z.infer<typeof AuthenticationSchema>