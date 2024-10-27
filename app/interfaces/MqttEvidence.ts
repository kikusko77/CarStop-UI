export interface MqttEvidence {
    id: number;
    requestAuthorEmail: string;
    heading: number;
    latitude: number;
    longitude: number;
    local: boolean;
    secured: number;
    speed: number;
    stationId: number;
    stationType: string;
    timestamp: string;
}
