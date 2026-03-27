import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ customTitle = null, categorySlug = null, categoryName = null }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    const backendToFrontendSlug = {
        'nha-tro-phong-tro': 'rental-rooms',
        'nha-nguyen-can': 'whole-houses',
        'can-ho': 'apartments',
    };

    const breadcrumbNameMap = {
        all: 'Tất cả',
        'rental-rooms': 'Nhà trọ, phòng trọ',
        'whole-houses': 'Nhà nguyên căn',
        apartments: 'Căn hộ',
        videos: 'Video Review',
        contact: 'Liên hệ',
        listing: 'Chi tiết',
    };

    const getFrontendSlug = slug => {
        return backendToFrontendSlug[slug] || slug;
    };

    return (
        <nav className="text-[12px] text-gray-500 mb-4">
            <Link to="/" className="text-blue-600 hover:text-[#ff5c00]">
                Trang chủ
            </Link>

            {categorySlug && categoryName && (
                <>
                    <span> / </span>
                    <Link
                        to={`/${getFrontendSlug(categorySlug)}`}
                        className="text-blue-600 hover:text-[#ff5c00]"
                    >
                        {categoryName}
                    </Link>
                </>
            )}

            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                if (value === 'listing' || !isNaN(value)) {
                    return null;
                }

                if (categorySlug && value === categorySlug) {
                    return null;
                }

                return (
                    <span key={to}>
                        {' / '}
                        {isLast ? (
                            <span className="text-gray-700">
                                {breadcrumbNameMap[value] || value}
                            </span>
                        ) : (
                            <Link to={to} className="text-blue-600 hover:text-[#ff5c00]">
                                {breadcrumbNameMap[value] || value}
                            </Link>
                        )}
                    </span>
                );
            })}

            {customTitle && (
                <>
                    <span> / </span>
                    <span className="text-gray-700">{customTitle}</span>
                </>
            )}
        </nav>
    );
};

export default Breadcrumb;
