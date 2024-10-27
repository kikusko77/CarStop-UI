'use client'
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import { useMqtt } from "@/app/eloryks/components/providers/MqttContext";
import { Button } from "primereact/button";
import { Message } from "@/app/api/intl/IntlMessage";
import { useEffect, useState } from "react";

export default function Map() {
    const { camData, processNearbyVehicles, blockedVehicles, setSelectedRecords, selectedRecords } = useMqtt();
    const [action, setAction] = useState(null);

    const CarIcon = L.icon({
        iconUrl: '/eloryks/car.png',
        iconSize: [40, 55],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });
    const PoliceIcon = L.icon({
        iconUrl: '/eloryks/police.png',
        iconSize: [40, 45],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });
    const RsuIcon = L.icon({
        iconUrl: '/eloryks/rsu.png',
        iconSize: [40, 50],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });
    const BlockedCarIcon = L.icon({
        iconUrl: '/eloryks/stopCarIcon.png',
        iconSize: [40, 50],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });
    const BlockedPoliceCarIcon = L.icon({
        iconUrl: '/eloryks/policeStop.png',
        iconSize: [40, 50],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });
    const chooseIcon = (stationType: number, stationID: number) => {
        if (blockedVehicles.has(stationID)) {
            if (stationType === 5) {
                return BlockedCarIcon;
            } else if (stationType === 12) {
                return BlockedPoliceCarIcon;
            }
        } else if (stationType === 15) {
            return RsuIcon;
        } else if (stationType === 12) {
            return PoliceIcon;
        } else if (stationType === 5) {
            return CarIcon;
        }
        return CarIcon;
    };

    const handleStopVehicle = (record: any) => {
        setSelectedRecords([record]);
        // @ts-ignore
        setAction('STOP');
    };

    const handleUnblockVehicle = (record: any) => {
        setSelectedRecords([record]);
        // @ts-ignore
        setAction('UNBLOCK');
    };

    const handleStopPeriodicSending = (record: any) => {
        setSelectedRecords([record]);
        // @ts-ignore
        setAction('PERIODIC_SENDING');
    };

    useEffect(() => {
        if (action) {
            processNearbyVehicles(action);
            setAction(null);
        }
    }, [selectedRecords, action, processNearbyVehicles]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <MapContainer
                        center={[49.39263019150008, 15.546878163414954]}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: "700px", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {camData.map(record => (
                            <Marker
                                key={record.stationID}
                                position={[record.latitude, record.longitude]}
                                icon={chooseIcon(record.stationType, record.stationID)}
                            >
                                <Popup>
                                    <div className="flex flex-column">
                                        <div className="mb-2">Station ID: <strong>{record.stationID}</strong></div>
                                        {record.stationType !== 15 && blockedVehicles.has(record.stationID) && (
                                            <>
                                                <Button
                                                    onClick={() => handleUnblockVehicle(record)}
                                                    className="p-button-success mb-2 p-button-block"
                                                >
                                                    <Message>{'vehicle.unBlock'}</Message>
                                                </Button>
                                                <Button
                                                    onClick={() => handleStopPeriodicSending(record)}
                                                    className="p-button-info p-button-block"
                                                >
                                                    <Message>{'vehicle.stopPeriodicSending'}</Message>
                                                </Button>
                                            </>
                                        )}
                                        {record.stationType !== 15 && !blockedVehicles.has(record.stationID) && (
                                            <>
                                                <Button
                                                    onClick={() => handleStopVehicle(record)}
                                                    className="p-button-danger mb-2 p-button-block"
                                                >
                                                    <Message>{'vehicle.stop'}</Message>
                                                </Button>
                                                <Button
                                                    onClick={() => handleUnblockVehicle(record)}
                                                    className="p-button-success mb-2 p-button-block"
                                                >
                                                    <Message>{'vehicle.unBlock'}</Message>
                                                </Button>
                                                <Button
                                                    onClick={() => handleStopPeriodicSending(record)}
                                                    className="p-button-info p-button-block"
                                                >
                                                    <Message>{'vehicle.stopPeriodicSending'}</Message>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
