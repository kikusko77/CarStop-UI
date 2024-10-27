import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { Vehicle } from "@/app/interfaces/VehicleCreate";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";

interface MqttEvidenceContextType {
    selectedEvidences: MqttEvidence[];
    setSelectedEvidences: (evidences: MqttEvidence[]) => void;
}

const MqttEvidenceContext = createContext<MqttEvidenceContextType>({
    selectedEvidences: [],
    setSelectedEvidences: () => {},
});

export const useMqttEvidenceContext = () => useContext(MqttEvidenceContext);

export const MqttEvidenceProvider: React.FC<{ children: ReactNode }> =
    ({children,}) => {
    const [selectedEvidences, setSelectedEvidences] = useState<MqttEvidence[]>([]);
    useEffect(() => {
    }, [selectedEvidences]);

    return (
        <MqttEvidenceContext.Provider
            value={{
                selectedEvidences,
                setSelectedEvidences,
            }}
        >
            {children}
        </MqttEvidenceContext.Provider>
    );
};

export default MqttEvidenceProvider;
