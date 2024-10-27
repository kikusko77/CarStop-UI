'use client'
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import {useQueryClient} from "@tanstack/react-query";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";

export default function Map() {
    const queryClient = useQueryClient();
    const evidences = queryClient.getQueryData<MqttEvidence[]>(['mqttEvidence']) || [];
    const BlockedCarIcon = L.icon({
        iconUrl: '/eloryks/stopCarIcon.png',
        iconSize: [40, 50],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });


    return (
        <div className="grid">
            <div className="col-1"></div>
            <div className="col-10">
                <div className="card">
                    <MapContainer
                        center={[49.39263019150008, 15.546878163414954]}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{height: "450px", width: "100%"}}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {evidences.map(evidence => (
                            <Marker
                                key={evidence.stationId}
                                position={[evidence.latitude, evidence.longitude]}
                                icon={BlockedCarIcon}
                            >
                                <Popup>Vehicle ID: <strong>{evidence.stationId}</strong></Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
            <div className="col-1"></div>
        </div>
    );
}
