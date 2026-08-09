'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ClipboardCheck, Flame, Search, Video, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { PromotionRequest } from '@/features/backoffice/types';
import { formatCurrency, formatDate, getApiErrorMessage, publicListingUrl } from '@/features/backoffice/utils';

type Decision = 'approve' | 'reject';

export default function RequestsPage() {
    const [requests, setRequests] = useState<PromotionRequest[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PromotionRequest | null>(null);
    const [decision, setDecision] = useState<Decision>('approve');
    const [videoUrl, setVideoUrl] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRequests(await backofficeApi.listPromotionRequests(filter === 'all' ? undefined : filter));
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải các yêu cầu cần duyệt.'));
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleRequests = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return requests
            .filter(item => !keyword || item.listing_name?.toLowerCase().includes(keyword) || item.user_name?.toLowerCase().includes(keyword))
            .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
    }, [requests, search]);

    const openDecision = (request: PromotionRequest, nextDecision: Decision) => {
        setSelected(request);
        setDecision(nextDecision);
        setVideoUrl(request.video_url || '');
        setAdminNote('');
    };

    const closeDecision = () => {
        if (submitting) return;
        setSelected(null);
        setVideoUrl('');
        setAdminNote('');
    };

    const submitDecision = async () => {
        if (!selected) return;
        if (decision === 'approve' && selected.request_type === 'video' && !videoUrl.trim()) {
            toast.error('Vui lòng cung cấp URL video trước khi duyệt.');
            return;
        }
        if (decision === 'reject' && !adminNote.trim()) {
            toast.error('Vui lòng nhập lý do từ chối.');
            return;
        }
        setSubmitting(true);
        try {
            const response = selected.request_type === 'video'
                ? decision === 'approve'
                    ? await backofficeApi.approveVideo(selected.id, videoUrl.trim(), adminNote.trim())
                    : await backofficeApi.rejectVideo(selected.id, adminNote.trim())
                : decision === 'approve'
                    ? await backofficeApi.approveHot(selected.id, adminNote.trim())
                    : await backofficeApi.rejectHot(selected.id, adminNote.trim());
            toast.success(response.message);
            closeDecision();
            await load();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể xử lý yêu cầu.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingState label="Đang tải yêu cầu cần duyệt..." />;

    return (
        <div className="space-y-6">
            <PageHeading title="Duyệt yêu cầu dịch vụ" description="Xử lý yêu cầu đăng video và đẩy tin HOT của chủ trọ." />
            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'approved', 'rejected'].map(item => (
                                <Button key={item} size="sm" variant={filter === item ? 'default' : 'secondary'} onClick={() => setFilter(item)}>
                                    {item === 'all' ? 'Tất cả' : item === 'pending' ? 'Chờ duyệt' : item === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                </Button>
                            ))}
                        </div>
                        <div className="relative block w-full lg:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin đăng hoặc chủ trọ" className="h-9 pl-9" />
                        </div>
                    </div>

                    <div className="mt-6">
                        {visibleRequests.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loại yêu cầu</TableHead>
                                        <TableHead>Tin đăng</TableHead>
                                        <TableHead>Chủ trọ</TableHead>
                                        <TableHead>Nội dung</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày gửi</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleRequests.map(request => (
                                        <TableRow key={`${request.request_type}-${request.id}`}>
                                            <TableCell>
                                                <Badge variant="outline" className={request.request_type === 'hot' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                                                    {request.request_type === 'hot' ? <Flame /> : <Video />}
                                                    {request.request_type === 'hot' ? 'Tin HOT' : 'Video'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <a href={publicListingUrl(request.listing_id)} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                                                    {request.listing_name || `Tin #${request.listing_id}`}
                                                </a>
                                                <p className="mt-1 text-xs text-muted-foreground">Mã tin: #{request.listing_id}</p>
                                            </TableCell>
                                            <TableCell className="font-medium">{request.user_name || '—'}</TableCell>
                                            <TableCell className="max-w-60 truncate text-muted-foreground">{request.request_type === 'hot' ? `${request.duration_days || 0} ngày · ${formatCurrency(request.fee)}` : request.note || 'Không có ghi chú'}</TableCell>
                                            <TableCell><StatusBadge status={request.status} /></TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(request.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                {request.status.toLowerCase() === 'pending' ? (
                                                    <div className="inline-flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => openDecision(request, 'approve')} className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"><Check />Duyệt</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => openDecision(request, 'reject')} className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"><X />Từ chối</Button>
                                                    </div>
                                                ) : <span className="text-xs text-muted-foreground">Đã xử lý</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState title="Không có yêu cầu phù hợp" description="Các yêu cầu video hoặc tin HOT mới sẽ xuất hiện tại đây." />}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={Boolean(selected)} onOpenChange={open => !open && closeDecision()}>
                <DialogContent className="sm:max-w-lg">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{decision === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}</DialogTitle>
                                <DialogDescription>
                                    {selected.listing_name || `Tin #${selected.listing_id}`} · {selected.request_type === 'hot' ? 'Tin HOT' : 'Video'} · {selected.user_name || 'Chưa cập nhật chủ trọ'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="rounded-lg bg-muted p-4 text-sm">
                                {selected.request_type === 'hot' && <p className="text-muted-foreground">Thời hạn: {selected.duration_days || 0} ngày · Phí: {formatCurrency(selected.fee)}</p>}
                            </div>
                            {decision === 'approve' && selected.request_type === 'video' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="video-url">URL video</Label>
                                    <Input id="video-url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://..." type="url" />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="admin-note">{decision === 'reject' ? 'Lý do từ chối' : 'Ghi chú cho chủ trọ (không bắt buộc)'}</Label>
                                <Textarea id="admin-note" value={adminNote} onChange={event => setAdminNote(event.target.value)} rows={3} placeholder={decision === 'reject' ? 'Nhập lý do từ chối' : 'Nhập ghi chú'} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" disabled={submitting} onClick={closeDecision}>Hủy</Button>
                                <Button variant={decision === 'approve' ? 'default' : 'destructive'} disabled={submitting} onClick={() => void submitDecision()}>
                                    {submitting ? 'Đang xử lý...' : decision === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
