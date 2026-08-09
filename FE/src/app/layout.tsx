import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/providers/AppProviders';
import { APP_DESCRIPTION, APP_NAME } from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: `Trang chủ | ${APP_NAME}`,
        template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="vi">
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
