export interface Vehicle {
    StationId: number,
    SpeedLimit: {
        Speed?: number;
        EngineSpeed?: number;
    },
    Position: {
        Speed: number;
        Heading: number;
        Latitude: number;
        Longitude: number;
        Timestamp: string;
    }
}

export interface VehicleUpdateData {
    Vehicle: Vehicle[];
}
