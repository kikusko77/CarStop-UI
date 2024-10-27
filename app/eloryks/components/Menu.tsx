'use client'

import {Menubar} from 'primereact/menubar';
import {Button} from "primereact/button";
import {ConfirmPopup, confirmPopup} from "primereact/confirmpopup";
import {signOut, useSession} from "next-auth/react";
import {usePathname, useRouter} from 'next/navigation'
import {useIntlContext} from "@/app/api/intl/IntlContext";
import {changeLocale} from "@/app/lib/changeLocale";
import {Message} from "@/app/api/intl/IntlMessage";
import {ReactElement} from "react";

export default function Menu() {

    const {data: session} = useSession();
    //@ts-ignore
    const userName = session?.user.email
    //@ts-ignore
    const role = session?.user.role as string[]
    const url = usePathname()
    const router = useRouter()
    const { locale } = useIntlContext()
    const items: { icon: string; label: ReactElement; url: string }[] = [
        ...((role && role.length > 0 && role.includes('ADMIN')) ? [
            {
                label: <Message>{'users'}</Message>,
                icon: 'pi pi-users',
                url: '/eloryks/users'
            }
        ] : []),
    ];

    const accept = async () => {
        try {
            const result = await signOut({
                redirect: false,
                callbackUrl: '/eloryks/login'
            })
            window.location.href = result.url;
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    const showTemplate = (event: any) => {
        confirmPopup({
            target: event.currentTarget,
            // @ts-ignore
            header: 'Confirmation',
            message: (
                <div className="flex flex-column align-items-center w-full gap-3 surface-border">
                    <i className="pi pi-info-circle text-4xl text-primary-500"></i>
                    <span><Message>{'user.email'}</Message><strong>{userName}</strong><br/><Message>{'user.role'}</Message> <strong>{role.join(', ')}</strong></span>
                </div>
            ),
            acceptIcon: 'pi pi-user-minus',
            rejectIcon: 'pi pi-times',
            rejectClass: 'p-button-sm',
            acceptClass: 'p-button-outlined p-button-sm',
            //@ts-ignore
            acceptLabel: <Message>{'log.out'}</Message>,
            //@ts-ignore
            rejectLabel: <Message>{'close'}</Message>,
            accept,
        });
    };

    const handleClick = () => {
        if (url === '/') {
            return null
        }
        router.push('/')
    };

    const toggleLocale = () => {
        changeLocale(locale=== 'en' ? 'cs' : 'en');
    };

    const start =
        <div className="flex align-items-center gap-2">
            {/*@ts-ignore*/}
            <Button onClick={handleClick} label={<Message>{'home'}</Message>} icon='pi pi-home' text/>
        </div>

    const end = (
        <div className="flex align-items-center gap-2">
            {/*@ts-ignore*/}
            <Button onClick={toggleLocale} label={<Message>{'change.language'}</Message>} icon='pi pi-language' text/>
            <Button icon='pi pi-user' onClick={showTemplate}/>
        </div>
    );

    return (
        <>
            <ConfirmPopup/>
            <div className="card fixed-card">
                {/*@ts-ignore*/}
                <Menubar model={items} start={start} end={end}/>
            </div>
        </>
    )
}
        