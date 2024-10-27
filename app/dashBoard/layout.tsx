'use client'

import Menu from "@/app/eloryks/components/Menu";
import "@/app/styles/GlobalStyles.css"
import {MqttProvider} from "@/app/eloryks/components/providers/MqttContext";

export default ({children}: any) => {
    return (
        <>
            <Menu/>
            <MqttProvider>
            <div className='pt-8'>
                {children}
            </div>
            </MqttProvider>
        </>
    )
}
