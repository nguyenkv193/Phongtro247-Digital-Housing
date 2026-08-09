import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { PropsWithChildren } from 'react';
import type { User, UserContextValue } from '@/types';

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async (): Promise<void> => {
        setLoading(true);
        const raw = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');

        try {
            const user: User | null = raw ? (JSON.parse(raw) as User) : null;

            if (user && token) {
                try {
                    const response = await axios.get<{ balance?: number }>(
                        `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')}/api/user/balance`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (response.data.balance !== undefined) {
                        user.balance = response.data.balance;
                    } else {
                        user.balance = 0;
                    }
                } catch (error) {
                    console.error('Failed to fetch balance:', error);
                    user.balance = 0;
                }
            }

            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
        const onAuthChanged = () => loadUser();
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    const updateBalance = (newBalance: number): void => {
        setCurrentUser(prev => (prev ? { ...prev, balance: newBalance } : null));
    };

    const refreshUser = (): void => {
        void loadUser();
    };

    return (
        <UserContext.Provider value={{ currentUser, loading, updateBalance, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};
