'use client';

import { useEffect } from 'react';
import { useRouter } from '@/router';
import { ShieldCheck } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useUser } from '@/providers/UserContext';

export default function BackofficeGuard({ children }: PropsWithChildren) {
    const { currentUser, loading } = useUser();
    const router = useRouter();
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        if (loading) return;
        if (!currentUser) {
            router.replace('/backoffice/login');
            return;
        }
        if (!isAdmin) router.replace('/');
    }, [currentUser, isAdmin, loading, router]);

    if (loading || !isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                        <ShieldCheck size={27} />
                    </span>
                    <p className="mt-4 font-semibold text-slate-800">Đang kiểm tra quyền truy cập</p>
                    <p className="mt-1 text-sm text-slate-500">Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}


