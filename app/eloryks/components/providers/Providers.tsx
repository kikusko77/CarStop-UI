"use client";
import {VehicleProvider} from "./VehicleContext";
import {UserProvider} from "./UserContext"
import MqttEvidenceProvider from "@/app/eloryks/components/providers/MqttEvidenceContext";

export function ContextProviders({children}: { children: React.ReactNode }) {
    return (
        // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MqttEvidenceProvider>
        <VehicleProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </VehicleProvider>
        </MqttEvidenceProvider>
        // </ThemeProvider>
    );
}
