import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { statusLabel } from '@/features/backoffice/utils';

export { Button } from '@/components/ui/button';

export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
    return (
        <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <Card className="border-dashed shadow-none">
            <CardContent className="px-6 py-12 text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Inbox size={20} />
                </span>
                <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export function PageHeading({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'blue',
}: {
    label: string;
    value: ReactNode;
    icon: LucideIcon;
    tone?: 'blue' | 'emerald' | 'orange' | 'purple';
}) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        orange: 'bg-orange-50 text-orange-700',
        purple: 'bg-violet-50 text-violet-700',
    };
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                    </div>
                    <span className={`flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
                        <Icon size={18} />
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
    const normalized = status?.toLowerCase() || '';
    const className =
        normalized === 'published' || normalized === 'approved' || normalized === 'resolved'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : normalized === 'rejected' || normalized === 'failed' || normalized === 'blocked'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : normalized === 'hidden'
                ? 'border-slate-200 bg-slate-100 text-slate-600'
                : 'border-amber-200 bg-amber-50 text-amber-700';
    return <Badge variant="outline" className={className}>{statusLabel(status)}</Badge>;
}


