import { z } from "zod";

export const PositionSchema = z.object({
  Speed: z
    .number({
      required_error: "Speed is required",
      invalid_type_error: "Speed is required",
    })
    .min(0, "Speed cannot be negative"),
  Heading: z
    .number({
      required_error: "Heading is required",
      invalid_type_error: "Heading is required",
    })
    .min(0, "Heading cannot be negative"),
  Latitude: z.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude is required",
  }),
  Longitude: z.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude is required",
  }),
  Timestamp: z.string({
    required_error: "Timestamp is required",
    invalid_type_error: "Timestamp is required",
  }),
});

export const EncryptionKeySchema = z.object({
  KeyType: z
    .number({
      invalid_type_error: "Encryption Key Type must be a number",
    })
    .nullable()
    .optional(),
  CoordX: z
    .string({
      invalid_type_error: "CoordX must be a string",
    })
    .max(255)
    .nullable()
    .optional(),
  CoordY: z
    .string({
      invalid_type_error: "CoordY must be a string",
    })
    .max(255)
    .nullable()
    .optional(),
});

export const SignKeySchema = z.object({
  KeyType: z.number({
    required_error: "Sign Key Type is required",
    invalid_type_error: "Sign Key Type is required",
  }),
  CoordX: z
    .string({
      invalid_type_error: "CoordX must be a string",
    })
    .min(1, { message: "CoordX is required" })
    .max(255),
  CoordY: z
    .string({
      invalid_type_error: "CoordY must be a string",
    })
    .min(1, { message: "CoordY is required" })
    .max(255),
});

export const vehicleSchema = z.object({
  StationId: z
    .number({
      required_error: "Station ID is required",
      invalid_type_error: "Station ID is required",
    })
    .min(0, "Station ID cannot be negative"),
  StationType: z
    .string({
      invalid_type_error: "Station Type must be a string",
    })
    .min(1, { message: "StationType is required" })
    .max(255),
  Position: PositionSchema,
  CertificateId: z
    .string({
      invalid_type_error: "Certificate ID must be a string",
    })
    .min(1, { message: "Certificate ID is required" })
    .max(255),
  EncryptionKey: EncryptionKeySchema.optional().nullable(),
  SignKey: SignKeySchema,
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
