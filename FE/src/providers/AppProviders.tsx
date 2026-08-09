'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FavoritesProvider } from '@/providers/FavoritesContext';
import { UserProvider } from '@/providers/UserContext';
import DynamicPageTitle from '@/components/layout/DynamicPageTitle';
import type { PropsWithChildren } from 'react';

export default function AppProviders({ children }: PropsWithChildren) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const appContent = (
        <UserProvider>
            <FavoritesProvider>
                <DynamicPageTitle />
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
    );

    return googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>{appContent}</GoogleOAuthProvider>
    ) : (
        appContent
    );
}


