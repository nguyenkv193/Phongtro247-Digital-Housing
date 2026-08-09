'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { APP_NAME, formatPageTitle } from '@/config/site';

const PAGE_TITLES: Array<[string, string]> = [
    ['/landlord-dashboard/create-new', 'Đăng tin mới'],
    ['/landlord-dashboard/accommodation', 'Quản lý chỗ ở'],
    ['/landlord-dashboard/account-info', 'Thông tin tài khoản chủ trọ'],
    ['/landlord-dashboard/complaints', 'Quản lý sự cố'],
    ['/landlord-dashboard/contracts', 'Quản lý hợp đồng'],
    ['/landlord-dashboard/deposit', 'Nạp tiền'],
    ['/landlord-dashboard/expenses', 'Quản lý chi phí'],
    ['/landlord-dashboard/invoices', 'Quản lý hóa đơn'],
    ['/landlord-dashboard/notifications', 'Thông báo'],
    ['/landlord-dashboard/reports', 'Báo cáo'],
    ['/landlord-dashboard/reviews', 'Đánh giá'],
    ['/landlord-dashboard/saved', 'Tin đã lưu'],
    ['/landlord-dashboard/services', 'Dịch vụ'],
    ['/landlord-dashboard/tenants', 'Quản lý người thuê'],
    ['/landlord-dashboard/transactions', 'Lịch sử giao dịch'],
    ['/landlord-dashboard/user-info', 'Thông tin cá nhân'],
    ['/landlord-dashboard', 'Bảng điều khiển chủ trọ'],
    ['/account-info/accommodation', 'Thông tin chỗ ở'],
    ['/account-info/account-info', 'Cài đặt tài khoản'],
    ['/account-info/notifications', 'Thông báo'],
    ['/account-info/reviews', 'Đánh giá của tôi'],
    ['/account-info/saved', 'Tin đã lưu'],
    ['/account-info/user-info', 'Thông tin cá nhân'],
    ['/account-info', 'Tài khoản'],
    ['/listing', 'Chi tiết tin đăng'],
    ['/payment-result', 'Kết quả thanh toán'],
    ['/verify-email', 'Xác thực email'],
    ['/rental-rooms', 'Nhà trọ, phòng trọ'],
    ['/whole-houses', 'Nhà nguyên căn'],
    ['/apartments', 'Căn hộ'],
    ['/videos', 'Video review'],
    ['/contact', 'Liên hệ'],
    ['/host-info', 'Thông tin chủ trọ'],
    ['/all', 'Tất cả tin đăng'],
];

function resolvePageTitle(pathname: string): string {
    if (pathname === '/') return 'Trang chủ';

    const matchedRoute = PAGE_TITLES.find(
        ([route]) => pathname === route || pathname.startsWith(`${route}/`),
    );

    return matchedRoute?.[1] || APP_NAME;
}

export default function DynamicPageTitle() {
    const pathname = usePathname() || '/';

    useEffect(() => {
        document.title = formatPageTitle(resolvePageTitle(pathname));
    }, [pathname]);

    return null;
}
