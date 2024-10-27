'use client'
import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from 'react';
import mqtt, {IClientOptions, MqttClient} from 'mqtt';
import {Cam, Denm, Ivi, IviSendingPeriodic} from '@/app/interfaces/Mqtt';
import {IClientPublishOptions} from "mqtt/lib/client";
import {QoS} from "mqtt-packet";
import {Toast} from "primereact/toast";
import {useMessage} from "@/app/api/intl/IntlMessage";
import {useCreateMqttEvidence} from "@/app/api/useMqttEvidence";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";
import {QueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";

interface MqttContextType {
    camData: Cam[];
    denmData: Denm[];
    iviData: Ivi[];
    publishMessage: (topic: string, message: string, publishOptions: { qos: QoS }) => void;
    unBlockVehicle: (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => void;
    stopVehicle: (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => void;
    stopPeriodicSending: (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => void;
    processNearbyVehicles: (action: string) => void;
    setCamData: (data: Cam[]) => void;
    selectedRecords: Cam[],
    setSelectedRecords: (camData: Cam[]) => void;
    blockedVehicles: Set<number>;
    vehiclesSendingPeriodic: Set<IviSendingPeriodic>;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

interface MqttProviderProps {
    children: ReactNode;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({children}) => {
    const [selectedRecords, setSelectedRecords] = useState<Cam[]>([]);
    const [camData, setCamData] = useState<Cam[]>([]);
    const [denmData, setDenmData] = useState<Denm[]>([]);
    const [iviData, setIviData] = useState<Ivi[]>([]);
    const [blockedVehicles, setBlockedVehicles] = useState<Set<number>>(new Set());
    const [client, setClient] = useState<MqttClient | null>(null);
    const [vehiclesSendingPeriodic, setVehiclesSendingPeriodic] = useState<Set<IviSendingPeriodic>>(new Set());
    const toast = useRef<Toast>(null);
    const stopTooltip = useMessage({value: "process"})
    const deleteRejectedTooltip = useMessage({value: "rejected"})
    const createEvidence = useCreateMqttEvidence();
    const queryClient = new QueryClient()
    const {data: session} = useSession();
    useEffect(() => {
        const loadStorageData = () => {
            const storedCamData = localStorage.getItem('camData');
            if (storedCamData) {
                setCamData(JSON.parse(storedCamData));
            }
            const storedDenmData = localStorage.getItem('denmData');
            if (storedDenmData) {
                setDenmData(JSON.parse(storedDenmData));
            }
            const storedIviData = localStorage.getItem('iviData');
            if (storedIviData) {
                setIviData(JSON.parse(storedIviData));
            }
            const storedBlockedVehicles = localStorage.getItem('blockedVehicles');
            if (storedBlockedVehicles) {
                setBlockedVehicles(new Set(JSON.parse(storedBlockedVehicles)));
            }
            const storedVehiclesSendingPeriodic = localStorage.getItem('vehiclesSendingPeriodic');
            if (storedVehiclesSendingPeriodic) {
                const parsed = JSON.parse(storedVehiclesSendingPeriodic);
                const restoredSet = new Set(parsed.map((item: any) => ({
                    ...item,
                    targetStationIdReceivingPeriodicMessages: new Set(Array.isArray(item.targetStationIdReceivingPeriodicMessages) ? item.targetStationIdReceivingPeriodicMessages : [])
                })));
                // @ts-ignore
                setVehiclesSendingPeriodic(restoredSet);
            }
        };

        loadStorageData();
    }, []);

    useEffect(() => {
        const options: IClientOptions = {
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID + `${Math.random().toString(16).slice(2)}`,
            clean: true,
            reconnectPeriod: 1000,
            username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
            password: process.env.NEXT_PUBLIC_MQTT_PWD,
        };
        const mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL as string, options);
        setClient(mqttClient);
        mqttClient.on('connect', () => {
            console.log('connecting client')
            mqttClient.subscribe([process.env.NEXT_PUBLIC_CAM as string,
                process.env.NEXT_PUBLIC_DENM as string, process.env.NEXT_PUBLIC_IVI as string,]);
        });

        mqttClient.on('error', (err) => {
            console.error('Connection Error:', err);
        });

        mqttClient.on('close', () => {
            console.log('Connection Closed');
        });

        mqttClient.on('offline', () => {
            console.log('Client Offline');
        });

        mqttClient.on('message', (topic, message) => {
                try {
                    const messageData = JSON.parse(message.toString());
                    const parts = topic.split('/');
                    const baseTopic = '/' + parts.slice(2).join('/');
                    const camListenTopic = formatTopic(process.env.NEXT_PUBLIC_CAM as string)
                    const denmListenTopic = formatTopic(process.env.NEXT_PUBLIC_DENM as string)
                    const iviListenTopic = formatTopic(process.env.NEXT_PUBLIC_IVI as string)
                    if (!Array.isArray(messageData)) {
                        console.error('Invalid message format, expected an array of arrays:', messageData);
                        return;
                    }
                    switch (baseTopic) {
                        case camListenTopic:
                            setCamData((prevData) => {
                                const dataMap = new Map(prevData.map(item => [item.stationID, item]));
                                messageData.forEach(item => {
                                    if (Array.isArray(item)) {
                                        const [stationID, data] = item;
                                        if (dataMap.has(stationID)) {
                                            dataMap.set(stationID, {...dataMap.get(stationID), ...data});
                                        } else {
                                            dataMap.set(stationID, data);
                                        }
                                    } else {
                                        console.error('Invalid entry format:', item);
                                    }
                                });
                                const updatedData = Array.from(dataMap.values());
                                localStorage.setItem('camData', JSON.stringify(updatedData));
                                return updatedData;
                            });
                            break;

                        case denmListenTopic:
                            // @ts-ignore
                            setDenmData(prevData => {
                                const updatedData = [...prevData, messageData];
                                localStorage.setItem('denmData', JSON.stringify(updatedData));
                                return updatedData;
                            });
                            break;
                        case iviListenTopic:
                            // @ts-ignore
                            setIviData(prevData => {
                                const updatedData = [...prevData, messageData];
                                localStorage.setItem('iviData', JSON.stringify(updatedData));
                                return updatedData;
                            });
                            break;
                        default:
                            console.error("Received message on unrecognized topic:", baseTopic);
                            break;
                    }
                } catch (e) {
                    console.error("Failed to process MQTT message:", e);
                }
            }
        );

        return () => {
            mqttClient.end();
        };
    }, []);

    const publishMessage = (topic: string, message: string, publishOptions?: IClientPublishOptions) => {
        client?.publish(topic, message, publishOptions);
    };

    function formatTopic(topic: string) {
        return topic.replace('/+', '');
    }

    const stopVehicle = (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => {
        if (!session || !session.user?.email || !session.user?.pwd) {
            throw new Error("Session email is missing.");
        }
        const newBlocked = new Set(blockedVehicles);
        const newVehiclesSendingPeriodic = new Set(vehiclesSendingPeriodic);
        stationIds.forEach(stationId => {
            const messageData = {
                sending: 'periodic',
                iviStatus: 0,
                iviIdentificationNumber: stationIdOfSelectedVehicleToStop,
                geographicContainer: {
                    zoneId: 0
                },
                textContainer: {
                    data: 100
                },
                vehicle: stationIdOfSelectedVehicleToStop
            };
            const topic = '/' + stationId + process.env.NEXT_PUBLIC_IVI as string;
            const messageString = JSON.stringify(messageData);
            const publishOptions = {
                qos: 2 as QoS
            };
            publishMessage(topic, messageString, publishOptions);
        });
        newVehiclesSendingPeriodic.add({
            sourceStationIdSendingPeriodicMessages: stationIdOfSelectedVehicleToStop,
            operation: 'STOP',
            targetStationIdReceivingPeriodicMessages: new Set(stationIds)
        });
        newBlocked.add(stationIdOfSelectedVehicleToStop);
        setBlockedVehicles(newBlocked);
        setVehiclesSendingPeriodic(newVehiclesSendingPeriodic);
        localStorage.setItem('blockedVehicles', JSON.stringify(Array.from(newBlocked)));
        localStorage.setItem('vehiclesSendingPeriodic', JSON.stringify(Array.from(newVehiclesSendingPeriodic).map(item => ({
            ...item,
            targetStationIdReceivingPeriodicMessages: Array.from(item.targetStationIdReceivingPeriodicMessages)
        }))));
        setSelectedRecords([]);
    };

    const stopPeriodicSending = (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => {
        const uniqueStationIds = new Set(stationIds);
        const newVehiclesSendingPeriodic = new Set([...vehiclesSendingPeriodic]
            .filter(veh => veh.sourceStationIdSendingPeriodicMessages !== stationIdOfSelectedVehicleToStop));
        uniqueStationIds?.forEach(stationId => {
            const messageData = {
                sending: 'stop',
                iviStatus: 2,
                vehicle: stationIdOfSelectedVehicleToStop
            };
            const topic = '/' + stationId + process.env.NEXT_PUBLIC_IVI as string;
            const messageString = JSON.stringify(messageData);
            const publishOptions = {
                qos: 2 as QoS
            };
            publishMessage(topic, messageString, publishOptions);
        });
        setVehiclesSendingPeriodic(newVehiclesSendingPeriodic);
        localStorage.setItem('vehiclesSendingPeriodic', JSON.stringify(Array.from(newVehiclesSendingPeriodic)));
        if (selectedRecords?.length) {
            toast.current?.show({
                severity: 'info',
                summary: stopTooltip,
                life: 3000
            });
        }
        setSelectedRecords([]);
    };

    const unBlockVehicle = (stationIds: number[], stationIdOfSelectedVehicleToStop: number) => {
        const newBlocked = new Set(blockedVehicles);
        const newVehiclesSendingPeriodic = new Set(vehiclesSendingPeriodic);
        stationIds.forEach(stationId => {
            const messageData = {
                sending: 'periodic',
                iviStatus: 1,
                iviIdentificationNumber: stationIdOfSelectedVehicleToStop,
                geographicContainer: {
                    zoneId: 0
                },
                textContainer: {
                    data: ''
                },
                vehicle: stationIdOfSelectedVehicleToStop
            };
            const topic = '/' + stationId + process.env.NEXT_PUBLIC_IVI as string;
            const messageString = JSON.stringify(messageData);
            const publishOptions = {
                qos: 2 as QoS
            };

            publishMessage(topic, messageString, publishOptions);
        });
        newVehiclesSendingPeriodic.add({
            sourceStationIdSendingPeriodicMessages: stationIdOfSelectedVehicleToStop,
            operation: 'UNBLOCK',
            targetStationIdReceivingPeriodicMessages: new Set(stationIds)
        });
        selectedRecords.forEach(record => {
            newBlocked.delete(record.stationID);
        });
        setBlockedVehicles(newBlocked);
        setVehiclesSendingPeriodic(newVehiclesSendingPeriodic);
        localStorage.setItem('blockedVehicles', JSON.stringify(Array.from(newBlocked)));
        localStorage.setItem('vehiclesSendingPeriodic', JSON.stringify(Array.from(newVehiclesSendingPeriodic).map(item => ({
            ...item,
            targetStationIdReceivingPeriodicMessages: Array.from(item.targetStationIdReceivingPeriodicMessages)
        }))));
        if (selectedRecords?.length) {
            toast.current?.show({
                severity: 'info',
                summary: stopTooltip,
                life: 3000
            });
        }
        setSelectedRecords([]);
    };

    function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }

    const processNearbyVehicles = (action: string): any => {
        const uniqueStationIDs = new Set<number>();
        selectedRecords.forEach(selected => {
            const nearbyVehicles = camData.filter(vehicle =>
                getDistanceFromLatLonInKm(selected.latitude, selected.longitude, vehicle.latitude, vehicle.longitude) <= 1
            );
            nearbyVehicles.forEach(vehicle => {
                if (vehicle.stationType === 15 || vehicle.stationType === 12) {
                    uniqueStationIDs.add(vehicle.stationID);
                }
            });
        });
        selectedRecords.forEach(selectedVehicleToStop => {
            if (uniqueStationIDs.size > 0 && action === 'STOP') {
                // TODO add to the list of sending periodic
                stopVehicle([...uniqueStationIDs], selectedVehicleToStop.stationID);
            } else if (uniqueStationIDs.size > 0 && action === 'UNBLOCK') {
                // TODO add to the list of sending periodic
                unBlockVehicle([...uniqueStationIDs], selectedVehicleToStop.stationID);
            } else if (uniqueStationIDs.size > 0 && action == 'PERIODIC_SENDING') {
                stopPeriodicSending([...uniqueStationIDs], selectedVehicleToStop.stationID);
            } else {
                console.log("No nearby RSUs are available for that car with stationId: " + selectedVehicleToStop.stationID);
            }
        });
    };

    useEffect(() => {
    }, [selectedRecords]);

    return (
        <MqttContext.Provider value={{
            camData,
            denmData,
            iviData,
            publishMessage,
            setCamData,
            selectedRecords,
            setSelectedRecords,
            stopVehicle,
            stopPeriodicSending,
            unBlockVehicle,
            processNearbyVehicles,
            blockedVehicles,
            vehiclesSendingPeriodic
        }}>
            <Toast ref={toast}/>
            {children}
        </MqttContext.Provider>
    );
};

export const useMqtt = (): MqttContextType => {
    const context = useContext(MqttContext);
    if (!context) {
        throw new Error('useMqtt must be used within an MqttProvider');
    }
    return context;
};
