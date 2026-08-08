'use client';

import LandlordDashboard from '@/features/landlord/pages/LandlordDashboard';
import { OutletChildrenProvider } from '@/lib/navigation/router-compat';
import { Suspense } from 'react';
import type { PropsWithChildren } from 'react';

export default function LandlordDashboardLayout({ children }: PropsWithChildren) {
    return (
        <OutletChildrenProvider outlet={children}>
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
                <LandlordDashboard />
            </Suspense>
        </OutletChildrenProvider>
    );
}



