'use client';

import AppShell from './AppShell';
import type { PropsWithChildren } from 'react';

type PageShellProps = PropsWithChildren<{ hideChrome?: boolean }>;

export default function PageShell({ children, hideChrome = false }: PageShellProps) {
    return <AppShell hideChrome={hideChrome}>{children}</AppShell>;
}


