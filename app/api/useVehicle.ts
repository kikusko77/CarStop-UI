"use client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import APIClient from "./apiClient";
import {Vehicle, VehicleData} from "../interfaces/VehicleCreate";
import {VehicleUpdateData} from "@/app/interfaces/VehicleUpdate";
import {useVehicleContext} from "../eloryks/components/providers/VehicleContext";
import {useSession} from "next-auth/react";

export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();
    return useMutation<Vehicle, Error, VehicleData>({
        mutationFn: async (updateData: VehicleData) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot update vehicle.");
            }
            const vehicleClient = new APIClient<VehicleUpdateData>(session.user?.email, session.user?.pwd);
            const response = await vehicleClient.put(updateData);
            const updatedVehicleId = response.responseVehicle[0].StationId;
            const updatedVehicleData = updateData.Vehicle.map((vehicle, index) => {
                if (index === 0) {
                    return {...vehicle, StationId: updatedVehicleId};
                }
                return vehicle;
            });

            return updatedVehicleData[0];
        },
        onSuccess: (updatedVehicleData) => {
            queryClient.setQueryData<Vehicle[]>(['vehicles'], (oldVehicles = []) => {
                return oldVehicles.map(vehicle =>
                    vehicle.StationId === updatedVehicleData.StationId ? {...vehicle, ...updatedVehicleData} : vehicle
                );
            });
        },
    });
};


export const useDeleteVehicles = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();
    const {setSelectedVehicles} = useVehicleContext();

    return useMutation<number[], Error, number[]>({
        mutationFn: async (ids) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot delete vehicle.");
            }
            const vehicleClient = new APIClient<VehicleUpdateData>(session.user?.email, session.user?.pwd);
            await vehicleClient.deleteMultipleByIds(ids);
            return ids;
        },
        onMutate: async (idsToDelete) => {
            await queryClient.cancelQueries({queryKey: ['vehicles']});
            const previousVehicles = queryClient.getQueryData<Vehicle[]>(['vehicles']);
            if (previousVehicles) {
                queryClient.setQueryData<Vehicle[]>(
                    ['vehicles'],
                    previousVehicles.filter((vehicle) => !idsToDelete.includes(vehicle.StationId))
                );
            }

            return {previousVehicles};
        },
        onError: (err, idsToDelete, context) => {
            // @ts-ignore
            if (context?.previousVehicles) {
                // @ts-ignore
                queryClient.setQueryData(['vehicles'], context.previousVehicles);
            }
        },
        onSettled: () => {
            setSelectedVehicles([]);
        },
    });
};


export const useCreateVehicle = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();

    return useMutation<Vehicle, Error, VehicleData>({
        mutationFn: async (vehicleData: VehicleData) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot create vehicle.");
            }
            const vehicleClient = new APIClient<VehicleData>(session.user?.email, session.user?.pwd);
            const response = await vehicleClient.post(vehicleData);
            const createdVehicleId = response.responseVehicle[0].StationId;
            const updatedVehicleData = vehicleData.Vehicle.map((vehicle, index) => {
                if (index === 0) {
                    return {...vehicle, StationId: createdVehicleId};
                }
                return vehicle;
            });

            return updatedVehicleData[0];
        },
        onSuccess: (newVehicle) => {
            queryClient.setQueryData<Vehicle[]>(['vehicles'], (oldVehicles = []) => {
                return [newVehicle, ...oldVehicles];
            });
        },
    });
};
