'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Flag, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backofficeApi } from '@/features/backoffice/api';
import { Button, EmptyState, LoadingState, PageHeading, StatCard, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { ListingReport } from '@/features/backoffice/types';
import { downloadCsv, formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

const statusFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'resolved', label: 'Đã giải quyết' },
    { value: 'rejected', label: 'Từ chối' },
] as const;

export default function ComplaintsPage() {
    const [reports, setReports] = useState<ListingReport[]>([]);
    const [filter, setFilter] = useState<(typeof statusFilters)[number]['value']>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setReports(await backofficeApi.listReports());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải báo cáo tin đăng.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleReports = useMemo(() => reports.filter(report => {
        const keyword = search.trim().toLowerCase();
        const matchesSearch = !keyword
            || report.reporter_name?.toLowerCase().includes(keyword)
            || report.listing_name?.toLowerCase().includes(keyword)
            || report.reason.toLowerCase().includes(keyword);
        return (filter === 'all' || report.status.toLowerCase() === filter) && matchesSearch;
    }), [filter, reports, search]);

    const updateStatus = async (report: ListingReport, status: string) => {
        setUpdatingId(report.id);
        try {
            const response = await backofficeApi.updateReportStatus(report.id, status);
            setReports(items => items.map(item => item.id === report.id ? { ...item, status } : item));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái báo cáo.'));
        } finally {
            setUpdatingId(null);
        }
    };

    const exportCsv = () => downloadCsv(
        `bao_cao_tin_dang_${new Date().toISOString().slice(0, 10)}.csv`,
        [
            ['Mã', 'Người báo cáo', 'Tin đăng', 'Lý do', 'Trạng thái', 'Ngày gửi'],
            ...visibleReports.map(item => [
                `BC-${String(item.id).padStart(4, '0')}`,
                item.reporter_name || '',
                item.listing_name || '',
                item.reason,
                item.status,
                formatDate(item.created_at),
            ]),
        ],
    );

    if (loading) return <LoadingState label="Đang tải báo cáo tin đăng..." />;

    const totalPending = reports.filter(item => item.status.toLowerCase() === 'pending').length;
    const totalResolved = reports.filter(item => item.status.toLowerCase() === 'resolved').length;

    return (
        <div className="space-y-7">
            <PageHeading
                title="Báo cáo tin đăng"
                description="Tiếp nhận và xử lý các báo cáo do người dùng gửi."
                action={(
                    <Button variant="outline" onClick={exportCsv} disabled={!visibleReports.length}>
                        <Download />
                        Xuất CSV
                    </Button>
                )}
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Tổng báo cáo" value={reports.length} icon={Flag} tone="orange" />
                <StatCard label="Chờ xử lý" value={totalPending} icon={Flag} tone="blue" />
                <StatCard label="Đã giải quyết" value={totalResolved} icon={Flag} tone="emerald" />
            </section>

            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusFilters.map(item => (
                                <Button
                                    key={item.value}
                                    size="sm"
                                    variant={filter === item.value ? 'default' : 'secondary'}
                                    onClick={() => setFilter(item.value)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                        <div className="relative block w-full lg:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin, người báo cáo" className="h-9 pl-10 pr-4" />
                        </div>
                    </div>

                    <div className="mt-6">
                        {visibleReports.length ? (
                            <Table className="min-w-[900px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Người báo cáo</TableHead>
                                        <TableHead>Tin đăng</TableHead>
                                        <TableHead>Lý do</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày gửi</TableHead>
                                        <TableHead className="text-right">Cập nhật</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleReports.map(report => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-mono text-xs font-semibold text-muted-foreground">BC-{String(report.id).padStart(4, '0')}</TableCell>
                                            <TableCell className="font-medium">{report.reporter_name || '—'}</TableCell>
                                            <TableCell className="font-medium">{report.listing_name || `Tin #${report.listing_id}`}</TableCell>
                                            <TableCell className="max-w-64 truncate text-muted-foreground">{report.reason}</TableCell>
                                            <TableCell><StatusBadge status={report.status} /></TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(report.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <Select
                                                    value={report.status}
                                                    disabled={updatingId === report.id}
                                                    onValueChange={value => void updateStatus(report, value)}
                                                >
                                                    <SelectTrigger size="sm" className="ml-auto w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                                                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                                        <SelectItem value="rejected">Từ chối</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState title="Không có báo cáo phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


