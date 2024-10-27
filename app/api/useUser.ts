"use client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import APIClient from "./apiClient";
import {useSession} from "next-auth/react";
import {User, UserData} from "@/app/interfaces/User";
import {useUserContext} from "@/app/eloryks/components/providers/UserContext";

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();

    return useMutation<User, Error, User>({
        mutationFn: async (user: User) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot create user.");
            }
            const userClient = new APIClient<User>(session.user?.email, session.user?.pwd);
            return await userClient.postUser(user);
        },
        onSuccess: (newUser) => {
            queryClient.setQueryData<User[]>(['users'], (oldUsers = []) => {
                return [newUser, ...oldUsers];
            });
        },
        onError: (error) => {
            // @ts-ignore
            if (error === 409) {
                alert("Conflict: This email is already in use.");
            } else {
                alert(`An unexpected error occurred: ${error.message || error}`);
            }
        }

    });
};
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();
    return useMutation<User, Error, User>({
        mutationFn: async (user: User) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot update user.");
            }
            const userClient = new APIClient<User>(session.user?.email, session.user?.pwd);
            return await userClient.putUser(user)
        },
        onSuccess: (updatedUserData) => {
            queryClient.setQueryData<User[]>(['users'], (oldUsers = []) => {
                return oldUsers.map(user =>
                    user.idPerson === updatedUserData.idPerson ? {...user, ...updatedUserData} : user
                );
            });
        },
        onError: (error) => {
            // @ts-ignore
            if (error === 409) {
                alert("Conflict: This email is already in use.");
            } else {
                alert(`An unexpected error occurred: ${error.message || error}`);
            }
        },
    });
};
export const useDeleteUsers = () => {
    const queryClient = useQueryClient();
    const {data: session} = useSession();
    const {setSelectedUsers} = useUserContext();

    return useMutation<number[], Error, number[]>({
        mutationFn: async (ids) => {
            if (!session || !session.user?.email || !session.user?.pwd) {
                throw new Error("Session, email, or password missing. Cannot delete user.")
            }
            const userClient = new APIClient<UserData>(session.user?.email, session.user?.pwd);
            await userClient.deleteMultipleUsersByIds(ids);
            return ids;
        },
        onMutate: async (idsToDelete) => {
            await queryClient.cancelQueries({queryKey: ['users']});
            const previousUsers = queryClient.getQueryData<User[]>(['users']);
            if (previousUsers) {
                queryClient.setQueryData<User[]>(
                    ['users'],
                    // @ts-ignore
                    previousUsers.filter((user) => !idsToDelete.includes(user.idPerson))
                )
            }

            return {previousUsers}
        },
        onError: (err, idsToDelete, context) => {
            // @ts-ignore
            if (context?.previousUsers) {
                // @ts-ignore
                queryClient.setQueryData(['users'], context.previousUsers)
            }
        },
        onSettled: () => {
            setSelectedUsers([]);
        }
    });
}