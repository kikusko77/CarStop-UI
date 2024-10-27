import {z} from "zod";

const roleSchema = z.object({
    name: z.string({ required_error: "Role name is required" }),
    idRole: z.number({ required_error: "Role ID is required" }),
});
export const baseUserSchema = z.object({
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Invalid email type"
    }).email(),
    givenName: z.string().default('').optional().nullable(),
    familyName: z.string().default('').optional().nullable(),
    nickname: z.string().default('').optional().nullable(),
    personRoles: z.array(z.object({
        idRole: z.number({
            required_error: "Role ID is required",
            invalid_type_error: "Role ID is required"
        }).min(0, "Role ID cannot be negative").optional().nullable(),
        startedAt: z.date({
            required_error: "Started At is required",
            invalid_type_error: "Started At is required",
        }),
        endedAt: z.date().default(new Date()).optional().nullable(),
        expirationDate: z.date().default(new Date()).optional().nullable(),
    })),
    pwd: z.string().optional(),
    roles: z.array(roleSchema).nonempty("At least one role is required"),
})

export const updateUserSchema = baseUserSchema;
export const createUserSchema = baseUserSchema.extend({
    pwd: z.string({required_error: "Password is required"}), // Enforce required for update
});
export type UserFormData = z.infer<typeof baseUserSchema>;
