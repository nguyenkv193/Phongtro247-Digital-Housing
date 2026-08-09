import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Nhà trọ, phòng trọ' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
