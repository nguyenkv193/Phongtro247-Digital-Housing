import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.role === 'admin') {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            console.log('=== LOGIN DEBUG ===');
            console.log('Email:', email);
            console.log('API URL:', `${API_URL}/api/auth/login`);

            const response = await axios.post(`${API_URL}/api/auth/login`, {
                emailOrPhone: email,
                password,
            });

            console.log('Response:', response.data);

            const { token, user: userData } = response.data;

            if (token && userData) {
                console.log('User data:', userData);
                console.log('User role:', userData.role);

                if (userData.role !== 'admin') {
                    throw new Error('Bạn không có quyền truy cập admin panel!');
                }

                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(userData));
                setUser(userData);

                console.log('✅ Login thành công!');
                return { success: true };
            } else {
                console.error('Response không có token hoặc user:', response.data);
                throw new Error(response.data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('=== LOGIN ERROR ===');
            console.error('Error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Đăng nhập thất bại',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
