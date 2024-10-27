import {getAuth} from "@/app/lib/auth";
import APIClient from "@/app/api/apiClient";

export async function fetchUsers() {
    const session = await getAuth()
    const email = session?.user?.email
    const pwd = session?.user?.pwd
    // @ts-ignore
    const vehicleClient = new APIClient(email, pwd);
    return await vehicleClient.getAllUsers();
}