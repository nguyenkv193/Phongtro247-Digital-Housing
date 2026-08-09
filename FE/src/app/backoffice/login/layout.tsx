import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Đăng nhập quản trị' };

export default function LoginLayout({ children }: PropsWithChildren) {
    return children;
}
