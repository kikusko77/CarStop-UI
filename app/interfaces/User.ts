export interface User {
    idPerson?: number;
    email: string;
    givenName?: string | null;
    familyName?: string | null;
    nickname?: string | null;
    pwd?: string;
    personRoles: {
        idRole?: number | null;
        startedAt: Date;
        endedAt?: Date | null;
        expirationDate?: Date | null;
    }[];
    roles: {
        idRole: number;
        name: string
    }[]
}

export interface UserData {
    User: User[];
}
