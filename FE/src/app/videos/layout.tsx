import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Video review' };

export default function RouteLayout({ children }: PropsWithChildren) {
    return children;
}
