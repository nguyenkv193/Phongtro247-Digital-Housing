import React, { useState, useEffect } from 'react';
import CreateListingForm from './CreateListingForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDoorClosed,
    faHotel,
    faHouse,
    faPlus,
    faEye,
    faTrash,
    faMapMarkerAlt,
    faRulerCombined,
    faDollarSign,
    faExclamationTriangle,
    faEyeSlash,
    faVideo,
    faFire,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import { useOutletContext } from 'react-router-dom';
import VideoRequestModal from '../components/VideoRequestModal';
import HotListingRequestModal from '../components/HotListingRequestModal';

const POSTING_FEES = {
    'Nhà trọ, phòng trọ': 0,
    'Nhà nguyên căn': 1000000,
    'Căn hộ': 1500000,
};

const rentalTypes = [
    {
        title: 'Nhà trọ, phòng trọ',
        desc: 'Loại hình phổ biến, dễ cho thuê, phù hợp sinh viên và người đi làm; giá hợp lý, nhu cầu cao quanh trường học và khu công nghiệp.',
        icon: <FontAwesomeIcon icon={faDoorClosed} />,
        requiresFee: false,
        fee: 0,
    },
    {
        title: 'Nhà nguyên căn',
        desc: 'Thích hợp cho gia đình hoặc nhóm người thuê dài hạn; diện tích rộng rãi, an ninh đảm bảo, dễ duy trì nguồn thu ổn định.',
        icon: <FontAwesomeIcon icon={faHouse} />,
        requiresFee: true,
        fee: 1000000,
    },
    {
        title: 'Căn hộ',
        desc: 'Phù hợp gia đình nhỏ hoặc khách thuê dài hạn; tiện nghi, hiện đại, an ninh tốt, giá trị cho thuê cao và khách hàng ổn định.',
        icon: <FontAwesomeIcon icon={faHotel} />,
        requiresFee: true,
        fee: 1500000,
    },
];

export default function DashboardHome() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [selectedType, setSelectedType] = useState(null);
    const [showTypeSelection, setShowTypeSelection] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
    const [selectedTypeFee, setSelectedTypeFee] = useState(0);
    const [showVideoRequestModal, setShowVideoRequestModal] = useState(false);
    const [showHotModal, setShowHotModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const { currentUser } = useOutletContext();

    useEffect(() => {
        fetchMyListings();
    }, [filter]);

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await axios.get(`${API_URL}/api/listings/my-listings`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            if (response.data.success) {
                setListings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async id => {
        if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.'))
            return;
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.delete(`${API_URL}/api/listings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                alert('Xóa tin đăng thành công!');
                fetchMyListings();
            }
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tin đăng!');
        }
    };

    const handleHideListing = async id => {
        if (
            !confirm(
                'Bạn có chắc chắn muốn ẩn tin đăng này không? Nó sẽ không còn hiển thị công khai.'
            )
        )
            return;
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.patch(
                `${API_URL}/api/listings/${id}/hide`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                alert('Ẩn tin đăng thành công!');
                fetchMyListings();
            }
        } catch (error) {
            console.error('Error hiding listing:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi ẩn tin đăng!');
        }
    };

    const handleUnhideListing = async id => {
        if (!confirm('Bạn muốn hiển thị lại tin đăng này? ')) return;
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.patch(
                `${API_URL}/api/listings/${id}/unhide`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                alert('Tin đăng đã được hiển thị lại thành công!');
                fetchMyListings();
            }
        } catch (error) {
            console.error('Error unhiding listing:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const formatPrice = price => {
        if (!price) return '0 đồng';
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu/tháng`;
        }
        return `${price.toLocaleString('vi-VN')} đồng/tháng`;
    };

    const getStatusBadge = status => {
        const statusConfig = {
            published: { label: 'Đang hiển thị', color: 'bg-green-100 text-green-800' },
            pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
            rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
            hidden: { label: 'Đã ẩn', color: 'bg-gray-100 text-gray-800' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (selectedType) {
        return (
            <CreateListingForm
                type={selectedType}
                onBack={() => {
                    setSelectedType(null);
                    setShowTypeSelection(false);
                    fetchMyListings();
                }}
            />
        );
    }

    const handleTypeSelect = type => {
        if (type.requiresFee) {
            const userBalance = currentUser?.balance || 0;
            if (userBalance < type.fee) {
                setSelectedTypeFee(type.fee);
                setShowInsufficientBalanceModal(true);
                return;
            }
        }
        setSelectedType(type.title);
    };

    if (showTypeSelection) {
        return (
            <>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-[#2e2a2a]">CHỌN LOẠI HÌNH</h2>
                        <button
                            onClick={() => setShowTypeSelection(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ← Quay lại
                        </button>
                    </div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Số dư tài khoản:</span>
                            <span className="text-lg font-bold text-blue-600">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(currentUser?.balance || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rentalTypes.map((type, idx) => {
                            const userBalance = currentUser?.balance || 0;
                            const hasEnoughBalance = !type.requiresFee || userBalance >= type.fee;
                            return (
                                <div
                                    key={idx}
                                    className={`border rounded-lg p-6 flex flex-col items-center justify-between transition gap-y-2 ${
                                        !hasEnoughBalance
                                            ? 'border-gray-300 bg-gray-50 opacity-75'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="text-4xl mb-2 w-20 h-20 flex items-center justify-center bg-[#eaf2ff] rounded-full">
                                        <span className="text-[#006ffd]">{type.icon}</span>
                                    </div>
                                    <div className="font-[500] mb-3 text-center">{type.title}</div>
                                    <div className="text-[15px] text-gray-500 mb-2 text-center">
                                        {type.desc}
                                    </div>
                                    {type.requiresFee && (
                                        <div className="mb-3 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                                            <span className="text-xs text-orange-700 font-medium">
                                                Phí đăng tin:{' '}
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(type.fee)}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        className={`w-full max-w-[300px] h-[38px] text-white text-sm px-4 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 transition-opacity duration-300 ${
                                            hasEnoughBalance
                                                ? 'bg-[#006ffd] hover:opacity-80 cursor-pointer'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                        onClick={() => handleTypeSelect(type)}
                                        disabled={!hasEnoughBalance}
                                    >
                                        {!hasEnoughBalance && (
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                        )}
                                        <span>
                                            {hasEnoughBalance ? 'Đăng ngay' : 'Số dư không đủ'}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <InsufficientBalanceModal
                    show={showInsufficientBalanceModal}
                    onClose={() => setShowInsufficientBalanceModal(false)}
                    currentBalance={currentUser?.balance || 0}
                    requiredFee={selectedTypeFee}
                />
            </>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-[#2e2a2a]">DANH SÁCH TIN ĐĂNG</h2>
                <button
                    onClick={() => setShowTypeSelection(true)}
                    className="bg-[#006ffd] hover:opacity-80 transition-opacity duration-300 cursor-pointer text-white text-sm px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Đăng tin mới</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'published', label: 'Đang hiển thị' },
                    { value: 'pending', label: 'Chờ duyệt' },
                    { value: 'hidden', label: 'Đã ẩn' },
                    { value: 'rejected', label: 'Từ chối' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                            filter === tab.value
                                ? 'text-[#006ffd] border-b-2 border-[#006ffd]'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#006ffd]"></div>
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <FontAwesomeIcon icon={faDoorClosed} className="text-6xl" />
                    </div>
                    <p className="text-gray-500 mb-4">Bạn không có tin đăng nào trong mục này.</p>
                    <button
                        onClick={() => setShowTypeSelection(true)}
                        className="bg-[#006ffd] hover:opacity-80 transition-opacity duration-300 cursor-pointer text-white text-sm px-6 py-2 rounded-lg font-semibold"
                    >
                        Đăng tin đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {listings.map(listing => (
                        <div
                            key={listing.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-48 h-36 flex-shrink-0">
                                    <img
                                        src={
                                            listing.main_image
                                                ? `${API_URL}${listing.main_image}`
                                                : '/default-image.jpg'
                                        }
                                        alt={listing.name}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={e => {
                                            e.target.src = 'https://placehold.co/600x400';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-[#2e2a2a] mb-1 truncate">
                                                {listing.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {getStatusBadge(listing.status)}
                                                {listing.is_hot === 1 && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        HOT
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {listing.type_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faDollarSign}
                                                className="text-gray-400 w-4"
                                            />
                                            <span className="font-semibold text-[#006ffd]">
                                                {formatPrice(listing.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faRulerCombined}
                                                className="text-gray-400 w-4"
                                            />
                                            <span>{listing.area} m²</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faMapMarkerAlt}
                                                className="text-gray-400 w-4"
                                            />
                                            <span className="truncate">{listing.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faEye}
                                                className="text-gray-400 w-4"
                                            />
                                            <span>{listing.views || 0} lượt xem</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                window.open(`/listing/${listing.id}`, '_blank')
                                            }
                                            className="px-3 py-1.5 text-xs bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-1"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>Xem</span>
                                        </button>
                                        {listing.status === 'published' && (
                                            <button
                                                onClick={() => handleHideListing(listing.id)}
                                                className="px-3 py-1.5 text-xs bg-yellow-100 cursor-pointer hover:bg-yellow-200 text-yellow-700 rounded transition-colors flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon icon={faEyeSlash} />
                                                <span>Ẩn</span>
                                            </button>
                                        )}
                                        {listing.status === 'hidden' && (
                                            <button
                                                onClick={() => handleUnhideListing(listing.id)}
                                                className="px-3 py-1.5 text-xs bg-green-100 cursor-pointer hover:bg-green-200 text-green-700 rounded transition-colors flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                <span>Hiện lại</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(listing.id)}
                                            className="px-3 py-1.5 text-xs bg-red-100 cursor-pointer hover:bg-red-200 text-red-700 rounded transition-colors flex items-center gap-1"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            <span>Xóa</span>
                                        </button>
                                        {listing.status === 'published' && !listing.has_video && (
                                            <button
                                                onClick={() => {
                                                    setSelectedListing(listing);
                                                    setShowVideoRequestModal(true);
                                                }}
                                                className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faVideo} />
                                                <span>Yêu cầu video</span>
                                            </button>
                                        )}
                                        {listing.status === 'published' && listing.is_hot !== 1 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedListing(listing);
                                                    setShowHotModal(true);
                                                }}
                                                className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faFire} />
                                                <span>Đẩy Hot</span>
                                            </button>
                                        )}
                                        {listing.status === 'published' && listing.is_hot === 1 && listing.hot_until && (
                                            <>
                                                <div className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white rounded flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faFire} className="animate-pulse" />
                                                    <span className="font-medium">
                                                        HOT đến {new Date(listing.hot_until).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {/* Nút gia hạn nếu sắp hết hạn (còn < 3 ngày) */}
                                                {new Date(listing.hot_until) - new Date() < 3 * 24 * 60 * 60 * 1000 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedListing(listing);
                                                            setShowHotModal(true);
                                                        }}
                                                        className="px-3 py-1.5 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faFire} />
                                                        <span>Gia hạn HOT</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <VideoRequestModal
                        show={showVideoRequestModal}
                        onClose={() => {
                            setShowVideoRequestModal(false);
                            setSelectedListing(null);
                        }}
                        listingId={selectedListing?.id}
                        listingName={selectedListing?.name}
                    />
                    <HotListingRequestModal
                        show={showHotModal}
                        onClose={() => {
                            setShowHotModal(false);
                            setSelectedListing(null);
                        }}
                        listingId={selectedListing?.id}
                        listingName={selectedListing?.name}
                    />
                </div>
            )}
        </div>
    );
}
