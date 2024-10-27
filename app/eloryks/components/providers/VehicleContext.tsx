import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Vehicle } from "@/app/interfaces/VehicleCreate";

interface VehicleContextType {
  selectedVehicles: Vehicle[];
  setSelectedVehicles: (vehicles: Vehicle[]) => void;
}

const VehicleContext = createContext<VehicleContextType>({
  selectedVehicles: [],
  setSelectedVehicles: () => {},
});

export const useVehicleContext = () => useContext(VehicleContext);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
  }, [selectedVehicles]);

  return (
    <VehicleContext.Provider
      value={{
        selectedVehicles,
        setSelectedVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
