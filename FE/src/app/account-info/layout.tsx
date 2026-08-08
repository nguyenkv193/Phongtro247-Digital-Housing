'use client';

import Account from '@/features/account/pages/Account';
import AppShell from '@/components/layout/AppShell';
import { OutletChildrenProvider } from '@/lib/navigation/router-compat';
import type { PropsWithChildren } from 'react';

export default function AccountLayout({ children }: PropsWithChildren) {
    return (
        <AppShell>
            <OutletChildrenProvider outlet={children}>
                <Account />
            </OutletChildrenProvider>
        </AppShell>
    );
}



