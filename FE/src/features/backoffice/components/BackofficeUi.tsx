import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { statusLabel } from '@/features/backoffice/utils';

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
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox size={24} />
            </span>
            <p className="mt-4 font-semibold text-slate-700">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
    );
}

export function PageHeading({
    eyebrow = 'Backoffice',
    title,
    description,
    action,
}: {
    eyebrow?: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
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
        blue: 'from-blue-600 to-indigo-600',
        emerald: 'from-emerald-600 to-teal-600',
        orange: 'from-orange-500 to-rose-600',
        purple: 'from-violet-600 to-purple-700',
    };
    return (
        <article className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${tones[tone]}`}>
            <Icon className="absolute -right-3 -top-3 h-28 w-28 text-white/10" strokeWidth={1.25} />
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Icon size={20} />
            </span>
            <p className="mt-5 text-sm font-medium text-white/75">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </article>
    );
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
    const normalized = status?.toLowerCase() || '';
    const className =
        normalized === 'published' || normalized === 'approved' || normalized === 'resolved'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
            : normalized === 'rejected' || normalized === 'failed' || normalized === 'blocked'
              ? 'bg-rose-50 text-rose-700 ring-rose-100'
              : normalized === 'hidden'
                ? 'bg-slate-100 text-slate-600 ring-slate-200'
                : 'bg-amber-50 text-amber-700 ring-amber-100';
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>{statusLabel(status)}</span>;
}
