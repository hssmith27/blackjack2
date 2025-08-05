import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const [chipCount, setChipCount] = useState(0);
    const [email, setEmail] = useState("");

    return (
        <UserContext.Provider value = {{ chipCount, setChipCount, email, setEmail }}>{children}</UserContext.Provider>
    );
}
