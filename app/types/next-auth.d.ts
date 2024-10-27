// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
    interface User {
        pwd?: string;
        role?: string
    }

    interface Session {
        user?: User & { pwd?: string, role?: string };
    }
}
