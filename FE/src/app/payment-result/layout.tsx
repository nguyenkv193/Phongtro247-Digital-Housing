import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Kết quả thanh toán' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
