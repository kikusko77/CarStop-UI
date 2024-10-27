import {z} from "zod";

export const CreateEvidenceSchema = z.object({
    requestAuthorEmail: z
        .string({
            required_error: "Request Author Email is required",
            invalid_type_error: "Request Author Email is required",
        })
        .email(),
    heading: z.number()
        .nullable()
        .optional(),
    latitude: z.number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude is required",
    }),
    longitude: z.number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude is required",
    }),
    local: z.boolean()
        .nullable()
        .optional(),
    secured: z.number()
        .nullable()
        .optional(),
    speed: z.number()
        .nullable()
        .optional(),
    stationId: z.number({
        required_error: "Station Id is required",
        invalid_type_error: "Station Id is required",
    }),
    stationType: z.string({
        required_error: "Station Type is required",
        invalid_type_error: "Station Type is required",
    }),
    timestamp: z.date().optional()
});
export const UpdateEvidenceSchema = CreateEvidenceSchema.extend({
    timestamp: z.date({required_error: "Password is required"}).default(new Date())
})
export type EvidenceFormData = z.infer<typeof CreateEvidenceSchema>;
