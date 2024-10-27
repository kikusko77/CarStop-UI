"use client";
import  {ReactNode} from "react";
import { SessionProvider } from "next-auth/react";

const AuthProvider = ({ children, session }: {children: ReactNode, session?: any}) => {

    return <SessionProvider session={session} basePath={'/eloryks/api/auth'}>{children}</SessionProvider>;
};

export default AuthProvider;