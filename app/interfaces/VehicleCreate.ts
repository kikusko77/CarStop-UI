export interface Position {
    Speed: number;
    Heading: number;
    Latitude: number;
    Longitude: number;
    Timestamp: string;
}

export interface EncryptionKey {
    KeyType?: number | null;
    CoordX?: string | null;
    CoordY?: string | null;
}

export interface SignKey {
    KeyType: number;
    CoordX: string;
    CoordY: string;
}

export interface SpeedLimit {
    Speed?: number | null;
    EngineSpeed?: number | null;
}

export interface Vehicle {
    StationId: number;
    StationType: string;
    PositionId?: number;
    CertificateId: string;
    EncryptionKeyId?: number | null;
    SignKeyId?: number;
    SpeedLimitId?: number | null;
    Position: {
        Speed: number;
        Heading: number;
        Latitude: number;
        Longitude: number;
        Timestamp: string;
    }
}

export interface VehicleData {
    Vehicle: Vehicle[];
}
