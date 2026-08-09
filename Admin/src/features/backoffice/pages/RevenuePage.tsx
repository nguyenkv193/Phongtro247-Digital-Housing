'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Flame, ReceiptText, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backofficeApi } from '@/features/backoffice/api';
import { Button, EmptyState, LoadingState, PageHeading, StatCard } from '@/features/backoffice/components/BackofficeUi';
import type { RevenueItem } from '@/features/backoffice/types';
import { downloadCsv, formatCurrency, formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

export default function RevenuePage() {
    const [items, setItems] = useState<RevenueItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'hot' | 'standard'>('all');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await backofficeApi.listRevenue());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải doanh thu.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleItems = useMemo(
        () => items.filter(item => filter === 'all' || (filter === 'hot' ? item.is_hot : !item.is_hot)),
        [filter, items],
    );

    const summary = useMemo(() => {
        const now = new Date();
        const result = { today: 0, month: 0, year: 0 };
        items.forEach(item => {
            const createdAt = new Date(item.created_at);
            const amount = Number(item.amount) || 0;
            if (createdAt.getFullYear() === now.getFullYear()) {
                result.year += amount;
                if (createdAt.getMonth() === now.getMonth()) {
                    result.month += amount;
                    if (createdAt.getDate() === now.getDate()) result.today += amount;
                }
            }
        });
        return result;
    }, [items]);

    const exportCsv = () => downloadCsv(
        `doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`,
        [
            ['STT', 'Tin đăng', 'Chủ trọ', 'Loại dịch vụ', 'Số tiền (VND)', 'Thời điểm'],
            ...visibleItems.map((item, index) => [
                index + 1,
                item.listing_name || '',
                item.owner_name || '',
                item.is_hot ? 'Đẩy tin HOT' : 'Đăng video',
                Number(item.amount) || 0,
                formatDate(item.created_at, true),
            ]),
        ],
    );

    if (loading) return <LoadingState label="Đang tải doanh thu..." />;

    return (
        <div className="space-y-7">
            <PageHeading
                title="Doanh thu"
                description="Theo dõi các khoản phí dịch vụ được ghi nhận từ tin đăng."
                action={(
                    <Button variant="outline" onClick={exportCsv} disabled={!visibleItems.length}>
                        <Download />
                        Xuất CSV
                    </Button>
                )}
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Hôm nay" value={formatCurrency(summary.today)} icon={ReceiptText} tone="emerald" />
                <StatCard label="Tháng này" value={formatCurrency(summary.month)} icon={TrendingUp} tone="blue" />
                <StatCard label="Năm nay" value={formatCurrency(summary.year)} icon={CalendarDays} tone="purple" />
            </section>

            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">Lịch sử doanh thu</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{visibleItems.length} giao dịch hiển thị</p>
                        </div>
                        <div className="flex gap-2">
                            {([
                                ['all', 'Tất cả'],
                                ['hot', 'Tin HOT'],
                                ['standard', 'Video'],
                            ] as const).map(([value, label]) => (
                                <Button key={value} size="sm" variant={filter === value ? 'default' : 'secondary'} onClick={() => setFilter(value)}>
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        {visibleItems.length ? (
                            <Table className="min-w-[760px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Tin đăng</TableHead>
                                        <TableHead>Chủ trọ</TableHead>
                                        <TableHead>Dịch vụ</TableHead>
                                        <TableHead>Thời điểm</TableHead>
                                        <TableHead className="text-right">Số tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-semibold">{item.listing_name || 'Tin đăng đã xóa'}</TableCell>
                                            <TableCell className="text-muted-foreground">{item.owner_name || '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={item.is_hot ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                                                    {item.is_hot ? <Flame /> : <ReceiptText />}
                                                    {item.is_hot ? 'Đẩy tin HOT' : 'Đăng video'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(item.created_at, true)}</TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-700">{formatCurrency(item.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState title="Chưa có giao dịch" description="Doanh thu sẽ xuất hiện sau khi dịch vụ được duyệt." />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


