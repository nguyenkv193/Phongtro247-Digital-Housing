import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Xác thực email' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
