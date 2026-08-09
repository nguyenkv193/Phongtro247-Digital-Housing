import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Căn hộ' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
