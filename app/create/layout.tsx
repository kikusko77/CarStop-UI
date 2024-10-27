'use client'

import Menu from "@/app/eloryks/components/Menu";

export default ({children}: any) => {
    return (
        <>
            <Menu/>
            <div className='pt-8'>
                {children}
            </div>
        </>
    )
}
