'use client'
import {useEffect} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import L, {LatLngTuple} from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import {useQueryClient} from "@tanstack/react-query";
import {Vehicle} from "@/app/interfaces/VehicleUpdate";
import {useVehicleContext} from "@/app/eloryks/components/providers/VehicleContext";

function ReCenterMap({position}: any) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null;
}

export default function Map() {

    const queryClient = useQueryClient();
    const vehicles = queryClient.getQueryData<Vehicle[]>(['vehicles']) || [];
    const {selectedVehicles} = useVehicleContext();
    const carIcon = L.icon({
        iconUrl: 'https://www.freeiconspng.com/uploads/yellow-muscle-car-icon-png-14.png',
        iconSize: [40, 55],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });

    const center: LatLngTuple = selectedVehicles.length > 0
        ? [selectedVehicles[0].Position.Latitude, selectedVehicles[0].Position.Longitude]
        : vehicles.length > 0
            ? [vehicles[0].Position.Latitude, vehicles[0].Position.Longitude]
            : [49.22665695615129, 16.57624027502927];

    return (
        <div className="grid">
            <div className="col-1"></div>
            <div className="col-10">
                <div className="card">
                    <MapContainer
                        center={center}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{height: "450px", width: "100%"}}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {vehicles.map(vehicle => (
                            <Marker
                                key={vehicle.StationId}
                                position={[vehicle.Position.Latitude, vehicle.Position.Longitude]}
                                icon={carIcon}
                            >
                                <Popup>Vehicle ID: <strong>{vehicle.StationId}</strong></Popup>
                            </Marker>
                        ))}
                        <ReCenterMap position={center}/>
                    </MapContainer>
                </div>
            </div>
            <div className="col-1"></div>
        </div>
    );
}
