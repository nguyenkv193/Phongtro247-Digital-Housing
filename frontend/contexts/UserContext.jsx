/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        setLoading(true);
        const raw = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');

        try {
            const user = raw ? JSON.parse(raw) : null;

            if (user && token) {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/user/balance`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (response.data && response.data.balance !== undefined) {
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

    const updateBalance = newBalance => {
        setCurrentUser(prev => (prev ? { ...prev, balance: newBalance } : null));
    };

    const refreshUser = () => {
        loadUser();
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
