"use client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import APIClient from "./apiClient";
import {useSession} from "next-auth/react";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";
import {useMqttEvidenceContext} from "@/app/eloryks/components/providers/MqttEvidenceContext";

export const useUpdateMqttEvidence = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation<void, Error, MqttEvidence>({
        mutationFn: async (mqttData: MqttEvidence) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot update vehicle.");
            }
            const vehicleClient = new APIClient(session.user?.email, session.user?.pwd);
            await vehicleClient.putMqttEvidence(mqttData);
        },
        onSuccess: (data: any, variables: { stationId: any; }) => {
            queryClient.setQueryData<MqttEvidence[]>(['mqttEvidence'], (oldEvidence = []) => {
                return oldEvidence.map(evidence =>
                    evidence.stationId === variables.stationId ? { ...evidence, ...variables } : evidence
                );
            });
        },
    });
};

export const useCreateMqttEvidence = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation<void, Error, MqttEvidence>({
        mutationFn: async (mqttData: MqttEvidence) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot create vehicle.");
            }
            const vehicleClient = new APIClient<MqttEvidence>(session.user?.email, session.user?.pwd);
            await vehicleClient.postMqttEvidence(mqttData);
        },
        onSuccess: (data: any, variables: any) => {
            queryClient.setQueryData<MqttEvidence[]>(['mqttEvidence'], (oldEvidence = []) => {
                return [{ ...variables, timestamp: new Date().toISOString() }, ...oldEvidence];
            });
        },
    });
};

export const useDeleteMqttEvidence = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const { setSelectedEvidences } = useMqttEvidenceContext();

    return useMutation<number, Error, number>({
        mutationFn: async (id: number) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot delete vehicle.");
            }
            const vehicleClient = new APIClient<MqttEvidence[]>(session.user?.email, session.user?.pwd);
            await vehicleClient.deleteMqttEvidence(id);
            return id;
        },
        onMutate: async (idToDelete: any) => {
            await queryClient.cancelQueries({ queryKey: ['mqttEvidence'] });
            const previousEvidences = queryClient.getQueryData<MqttEvidence[]>(['mqttEvidence']);
            if (previousEvidences) {
                queryClient.setQueryData<MqttEvidence[]>(
                    ['mqttEvidence'],
                    previousEvidences.filter((evidence) => evidence.id !== idToDelete)
                );
            }
            return { previousEvidences };
        },
        onSettled: () => {
            setSelectedEvidences([]);
        },
    });
};
