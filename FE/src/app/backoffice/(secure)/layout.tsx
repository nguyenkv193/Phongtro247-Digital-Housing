import type { PropsWithChildren } from 'react';
import BackofficeShell from '@/features/backoffice/components/BackofficeShell';

export default function SecureBackofficeLayout({ children }: PropsWithChildren) {
    return <BackofficeShell>{children}</BackofficeShell>;
}
