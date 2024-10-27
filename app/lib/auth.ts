import CredentialsProvider from "next-auth/providers/credentials";
import {getServerSession, NextAuthOptions} from 'next-auth';

export const authOptions: NextAuthOptions = {

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},

            authorize: async (credentials) => {

                if (!credentials)
                    return null
                // @ts-ignore
                const basicAuth = Buffer.from(`${credentials.email}:${credentials.pwd}`).toString('base64');

                const res = await fetch(process.env.NEXT_PUBLIC_ELORYKS_BACKEND_API_BASE_URL + "/user/login", {
                    method: 'POST',
                    headers: {"Authorization": `Basic ${basicAuth}`},
                });

                const user = await res.json();

                if (res.ok && user) {
                    // @ts-ignore
                    return {...user, pwd: credentials.pwd};
                }

            }
        })
    ],

    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.pwd = user.pwd;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({session, token}) {
            if (token?.pwd) {
                // @ts-ignore
                session.user.pwd = token.pwd;
            }            // @ts-ignore
            session.user.email = token.email;
            //@ts-ignore
            session.user.role = token.role;
            return session;
        },
    },

    session: {
        strategy: 'jwt',
        maxAge: 3600,
        updateAge: 0,
    },
    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: '/eloryks/login',
    },

}
export const getAuth = () => getServerSession(authOptions)
