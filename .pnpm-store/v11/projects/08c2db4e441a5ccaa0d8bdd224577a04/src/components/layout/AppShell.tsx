'use client';

import BackToTop from '@/components/layout/BackToTop';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { Suspense } from 'react';
import type { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{ hideChrome?: boolean }>;

export default function AppShell({ children, hideChrome = false }: AppShellProps) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <div>
                {!hideChrome && <Header />}
                {children}
                {!hideChrome && <Footer />}
                <BackToTop />
                <ScrollToTop />
            </div>
        </Suspense>
    );
}


