export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5176';

export function publicListingUrl(id: number): string {
    return `${PUBLIC_APP_URL}/listing/${id}`;
}

export function formatCurrency(value: number | string | null | undefined): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

export function formatDate(value: string | null | undefined, includeTime = false): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
}

export function statusLabel(status: string | null | undefined): string {
    const labels: Record<string, string> = {
        active: 'Đang hoạt động',
        approved: 'Đã duyệt',
        blocked: 'Đã khóa',
        failed: 'Thất bại',
        hidden: 'Đã ẩn',
        pending: 'Đang chờ xử lý',
        published: 'Đã đăng',
        rejected: 'Đã từ chối',
        resolved: 'Đã giải quyết',
    };
    return labels[status?.toLowerCase() || ''] || status || 'Không xác định';
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
    const csv = rows
        .map(row =>
            row
                .map(value => {
                    const cell = String(value ?? '');
                    return /[",\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
                })
                .join(',')
        )
        .join('\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
}

export function getApiErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác.'): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
    ) {
        return error.response.data.message;
    }
    return fallback;
}

