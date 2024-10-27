export interface Cam {
    acceleration: number;
    heading: number;
    latitude: number;
    longitude: number;
    secured: number;
    speed: number;
    stationID: number;
    stationType: number;
    timestamp: number;
}

export interface CamResponse {
    sending: string;
    stationType: number
}

export interface IviSendingPeriodic {
    sourceStationIdSendingPeriodicMessages: number;
    operation: string;
    targetStationIdReceivingPeriodicMessages: Set<number>;
}

export interface Denm {
    causeCode: number;
    latitude: number;
    local: number;
    longtitude: number;
    stationID: number;
    stationType: number;
    subCauseCode: number;
}

export interface DenmResponse {
    sending: string;
    situationContainer: {
        causeCode: number;
        subCauseCode: number;
    }
}


export interface Ivi {
    latitude: number;
    local: number;
    longitude: number;
    stationID: number;
    text: string;
}

export interface IviResponse {
    sending: string;
    iviStatus: number;
    iviIdentificationNumber: number;
    geographicContainer: {
        zoneId: number
    };
    textContainer: {
        data: string
    }
}
