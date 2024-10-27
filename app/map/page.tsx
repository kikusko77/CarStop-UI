import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import('@/app/eloryks/components/Map'), {
    ssr: false,
});

async function Page() {


    return (
        <>
            <div>
                <MapWithNoSSR/>
            </div>
        </>
    );
}

export default Page;
