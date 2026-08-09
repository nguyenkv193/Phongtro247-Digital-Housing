import { createContext, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AdminSessionUser } from '@/types';

interface UserContextValue {
    currentUser: AdminSessionUser | null;
    loading: boolean;
    refreshUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function readUser(): AdminSessionUser | null {
    const raw = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (!raw || !token) return null;

    try {
        return JSON.parse(raw) as AdminSessionUser;
    } catch {
        return null;
    }
}

export function UserProvider({ children }: PropsWithChildren) {
    const [currentUser, setCurrentUser] = useState<AdminSessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = () => {
        setCurrentUser(readUser());
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('authChanged', loadUser);
        return () => window.removeEventListener('authChanged', loadUser);
    }, []);

    return <UserContext.Provider value={{ currentUser, loading, refreshUser: loadUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
}
