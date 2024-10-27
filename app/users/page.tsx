import {dehydrate, HydrationBoundary, QueryClient,} from '@tanstack/react-query'
import UsersDataTable from "@/app/eloryks/components/UsersDataTable";
import {fetchUsers} from "@/app/api/useUserSSR";

async function Page() {
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['users'],
        // @ts-ignore
        queryFn: () => fetchUsers(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UsersDataTable/>
        </HydrationBoundary>
    );
}

export default Page;
