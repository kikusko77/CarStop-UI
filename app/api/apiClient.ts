class APIClient<T> {

    static baseURL = process.env.NEXT_PUBLIC_ELORYKS_BACKEND_API_BASE_URL as string;
    email?: string;
    pwd?: string;

    constructor(email?: string, pwd?: string) {
        this.email = email;
        this.pwd = pwd;
    }

    createQueryParams(params: Record<string, string> = {}) {
        const defaultParams = {
            timestamp: new Date().toISOString(),
            responsible: "responsible_value",
        };
        const allParams = {...defaultParams, ...params};
        return new URLSearchParams(allParams).toString();
    }

    async getHeaders() {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        if (this.email && this.pwd) {
            const token = Buffer.from(`${this.email}:${this.pwd}`).toString('base64');
            headers["Authorization"] = `Basic ${token}`;
        }
        return headers;
    }

    async getAll() {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/all?${queryParams}`, {
            method: 'GET',
            headers: await this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error fetching vehicles: ${response.statusText}`);
        }

        const data = await response.json();
        return data.Vehicle;
    }

    async getById(id: number) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/${id}?${queryParams}`, {
            method: 'GET',
            headers: await this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.Vehicle;
    }

    async post(data: T) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}?${queryParams}`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error posting data: ${response.statusText}`);
        }
        return response.json();
    }

    async put<U>(data: U) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}?${queryParams}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error updating data: ${response.statusText}`);
        }
        return response.json();
    }

    async deleteMultipleByIds(ids: number[]) {
        const queryParams = this.createQueryParams({vehicles: ids.join(',')});
        const response = await fetch(`${APIClient.baseURL}?${queryParams}`, {
            method: 'DELETE',
            headers: await this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error deleting data: ${response.statusText}`);
        }
        return response.json();
    }

    async getAllUsers() {
        const queryParams = this.createQueryParams();
        const baseHeaders = await this.getHeaders();

        const response = await fetch(`${APIClient.baseURL}/allUsers?${queryParams}`, {
            method: 'GET',
            headers: await this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.statusText}`);
        }
        return await response.json();
    }

    async postUser(data: T) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/createUser?${queryParams}`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw response.status
        }

        return response.json();
    }

    async putUser<U>(data: U) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/updateUser?${queryParams}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw response.status
        }
        return response.json();
    }

    async deleteMultipleUsersByIds(ids: number[]) {
        const queryParams = this.createQueryParams({users: ids.join(',')});
        const response = await fetch(`${APIClient.baseURL}/deleteUser?${queryParams}`, {
            method: 'DELETE',
            headers: await this.getHeaders(),
        });

        if (response.ok) {
            return {};
        } else {
            throw new Error(`Error deleting data: ${response.statusText}`);
        }
    }

    async getAllMqttEvidence() {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/vehicle-speed-limiting-requests?${queryParams}`, {
            method: 'GET',
            headers: await this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error fetching vehicles: ${response.statusText}`);
        }
        return await response.json();
    }

    async postMqttEvidence(data: T) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/vehicle-speed-limiting-requests?${queryParams}`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error posting data: ${response.statusText}`);
        }
    }

    async putMqttEvidence<U>(data: U) {
        // @ts-ignore
        const id = data.id;
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/vehicle-speed-limiting-requests/${id}?${queryParams}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error updating data: ${response.statusText}`);
        }
    }

    async deleteMqttEvidence(id: number) {
        const queryParams = this.createQueryParams();
        const response = await fetch(`${APIClient.baseURL}/vehicle-speed-limiting-requests/${id}?${queryParams}`, {
            method: 'DELETE',
            headers: await this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error deleting data: ${response.statusText}`);
        }
    }
}

export default APIClient;
