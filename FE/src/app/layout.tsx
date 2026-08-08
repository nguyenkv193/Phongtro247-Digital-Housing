import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/providers/AppProviders';

export const metadata: Metadata = {
    title: 'Trọ Mới',
    description: 'Tìm phòng trọ, nhà nguyên căn và căn hộ phù hợp.',
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



