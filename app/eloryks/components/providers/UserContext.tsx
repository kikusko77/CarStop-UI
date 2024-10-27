import React, {createContext, ReactNode, useContext, useEffect, useState,} from "react";
import {User} from "@/app/interfaces/User";

interface UserContextType {
    selectedUsers: User[];
    setSelectedUsers: (users: User[]) => void;
}

const UserContext = createContext<UserContextType>({
    selectedUsers: [],
    setSelectedUsers: () => {
    },
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
                                                                    children,
                                                                }) => {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    useEffect(() => {
    }, [selectedUsers]);

    return (
        <UserContext.Provider
            value={{
                selectedUsers,
                setSelectedUsers,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
