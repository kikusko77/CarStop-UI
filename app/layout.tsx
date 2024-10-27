import Footer from "./eloryks/components/Footer";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Providers from "./providers";
import "./styles/GlobalStyles.css";
import {PrimeReactProvider} from "primereact/api";
import {ContextProviders} from "@/app/eloryks/components/providers/Providers";
import "primeflex/primeflex.css";
import React from "react";
import AuthProvider from "@/app/eloryks/components/providers/SessionProvider";
import 'primeflex/primeflex.css'
import {IntlProvider} from "@/app/api/intl/IntlProvider";

export const metadata = {
    title: "Eloryks",
    description: "Software for stopping vehicles",
};
export default async function RootLayout({children}: {children: React.ReactNode})
{
    return (
        <html lang="en">
        <AuthProvider>
            <body>
            <ContextProviders>
                <div className="content-wrapper">
                    <PrimeReactProvider>
                        <Providers>
                            <IntlProvider>
                            {children}
                            </IntlProvider>
                        </Providers>
                    </PrimeReactProvider>
                </div>
                <Footer/>
            </ContextProviders>
            </body>
        </AuthProvider>
        </html>
    );
}
