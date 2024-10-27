import VehicleDataTable from "../eloryks/components/VehicleDataTable";
import {dehydrate, HydrationBoundary, QueryClient,} from '@tanstack/react-query'
import {fetchVehicles} from "@/app/api/useVehicleSSR";
import dynamic from "next/dynamic";
import {TabPanel, TabView} from 'primereact/tabview';
import {Message} from "@/app/api/intl/IntlMessage";
import MqttEvidenceDataTable from "@/app/eloryks/components/MqttEvidenceDataTable";
import {fetchMqttEvidence} from "@/app/api/useMqttEvidenceSSR";

const MapWithNoSSR = dynamic(() => import('@/app/eloryks/components/Map'), {
    ssr: false,
});
const MqttMap = dynamic(() => import('@/app/eloryks/components/MqttMap'), {
    ssr: false,
});
const MqttData = dynamic(() => import('@/app/eloryks/components/MqttDataTable'), {
    ssr: false,
});
const MqttEvidenceMap = dynamic(() => import('@/app/eloryks/components/MqttEvidenceMap'), {
    ssr: false,
});

async function Page() {
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['vehicles'],
        // @ts-ignore
        queryFn: () => fetchVehicles(),
    });
    await queryClient.prefetchQuery({
        queryKey: ['mqttEvidence'],
        // @ts-ignore
        queryFn: () => fetchMqttEvidence(),
    });

    return (
        <>
            <TabView>
                <TabPanel header={<Message>{"vehicle.speed.limiting.management"}</Message>}>
                    <TabView>
                        <TabPanel header={<Message>{'mqtt.table'}</Message>}>
                            <MqttData/>
                        </TabPanel>
                        <TabPanel header={<Message>{'mqtt.map'}</Message>}>
                            <MqttMap/>
                        </TabPanel>
                    </TabView>
                </TabPanel>
                <TabPanel header={<Message>{"vehicle.speed.limiting.evidence"}</Message>}>
                    <TabView>
                        <TabPanel header={<Message>{'speed.limiting.evidence'}</Message>}>
                            <HydrationBoundary state={dehydrate(queryClient)}>
                                <VehicleDataTable/>
                            </HydrationBoundary>
                            <MapWithNoSSR/>
                        </TabPanel>
                        <TabPanel header={<Message>{'mqtt.evidence'}</Message>}>
                            <HydrationBoundary state={dehydrate(queryClient)}>
                                <MqttEvidenceDataTable/>
                            </HydrationBoundary>
                            <MqttEvidenceMap/>
                        </TabPanel>
                    </TabView>
                </TabPanel>
            </TabView>
        </>
    );
}

export default Page;
