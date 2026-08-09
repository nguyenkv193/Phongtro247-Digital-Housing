import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Tất cả tin đăng' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
