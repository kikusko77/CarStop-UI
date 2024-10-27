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

export const SpeedLimitSchema = z.object({
  Speed: z.number({
    required_error: "Speed is required",
    invalid_type_error: "Speed is required",
  }),
  EngineSpeed: z.number({
    required_error: "EngineSpeed is required",
    invalid_type_error: "EngineSpeed is required",
  }),
});

export const vehicleSchema = z.object({
  StationId: z
    .number({
      required_error: "Station ID is required",
      invalid_type_error: "Station ID is required",
    })
    .min(0, "Station ID cannot be negative"),

  SpeedLimit: SpeedLimitSchema.nullable().optional(),

  Position: PositionSchema,
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
