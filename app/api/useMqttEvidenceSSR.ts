import {getAuth} from "@/app/lib/auth";
import APIClient from "@/app/api/apiClient";

export async function fetchMqttEvidence(mail: string, password: string) {
    let session;
    try {
        session = await getAuth();
    } catch (error) {
        console.error('No backend session, trying client session...');
    }

    const email = session?.user?.email || mail;
    const pwd = session?.user?.pwd || password;
    if (!email || !pwd) {
        throw new Error("Authentication credentials are missing.");
    }

    // @ts-ignore
    const vehicleClient = new APIClient(email, pwd);
    return await vehicleClient.getAllMqttEvidence();
}