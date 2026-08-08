'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FavoritesProvider } from '@/providers/FavoritesContext';
import { UserProvider } from '@/providers/UserContext';
import type { PropsWithChildren } from 'react';

export default function AppProviders({ children }: PropsWithChildren) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <UserProvider>
                <FavoritesProvider>
                    {children}
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </FavoritesProvider>
            </UserProvider>
        </GoogleOAuthProvider>
    );
}


