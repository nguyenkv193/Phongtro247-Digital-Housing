/* eslint-disable no-unused-vars */
import React, {
    useState,
    useEffect,
    type FormEvent,
    type KeyboardEvent,
    type MouseEvent,
} from 'react';
import { useParams, Link } from '@/lib/navigation/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShareNodes,
    faHeart,
    faFlag,
    faLocationDot,
    faPhone,
    faUser,
    faHome,
    faCalendar,
    faRulerCombined,
    faEye,
    faChevronLeft,
    faChevronRight,
    faXmark,
    faVideo,
    faStar,
    faTrash,
    faBed,
    faWifi,
    faSnowflake,
    faKitchenSet,
    faShower,
    faTv,
    faMotorcycle,
    faCar,
    faShieldHalved,
    faFire,
    faWater,
    faBolt,
    faHospital,
    faSchool,
    faCartShopping,
    faBus,
    faUtensils,
    faStore,
    faBuilding,
    faToilet,
    faShirt,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import ReportModal from '@/features/listings/components/ReportModal';
import { Helmet } from 'react-helmet';
import { useFavorites } from '@/providers/FavoritesContext';
import type { EntityId, ListingDetail as ListingDetailData, ListingReview } from '@/types';

const ListingDetail = () => {
    const { id } = useParams();
    const listingId = id ?? '';
    const [listing, setListing] = useState<ListingDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const getAmenityIcon = (amenity: string) => {
        const lowerAmenity = amenity.toLowerCase();
        if (
            lowerAmenity.includes('wifi') ||
            lowerAmenity.includes('mạng') ||
            lowerAmenity.includes('internet')
        )
            return faWifi;
        if (
            lowerAmenity.includes('điều hòa') ||
            lowerAmenity.includes('máy lạnh') ||
            lowerAmenity.includes('air')
        )
            return faSnowflake;
        if (
            lowerAmenity.includes('bếp') ||
            lowerAmenity.includes('nấu ăn') ||
            lowerAmenity.includes('nhà bếp')
        )
            return faKitchenSet;
        if (
            lowerAmenity.includes('nóng lạnh') ||
            lowerAmenity.includes('nước nóng') ||
            lowerAmenity.includes('bình nóng')
        )
            return faShower;
        if (
            lowerAmenity.includes('tivi') ||
            lowerAmenity.includes('tv') ||
            lowerAmenity.includes('truyền hình')
        )
            return faTv;
        if (
            lowerAmenity.includes('gửi xe') ||
            lowerAmenity.includes('đỗ xe') ||
            lowerAmenity.includes('bãi xe')
        )
            return faMotorcycle;
        if (
            lowerAmenity.includes('ô tô') ||
            lowerAmenity.includes('xe hơi') ||
            lowerAmenity.includes('4 chỗ')
        )
            return faCar;
        if (
            lowerAmenity.includes('an ninh') ||
            lowerAmenity.includes('bảo vệ') ||
            lowerAmenity.includes('camera')
        )
            return faShieldHalved;
        if (
            lowerAmenity.includes('giường') ||
            lowerAmenity.includes('nệm') ||
            lowerAmenity.includes('phòng ngủ')
        )
            return faBed;
        if (
            lowerAmenity.includes('vệ sinh') ||
            lowerAmenity.includes('toilet') ||
            lowerAmenity.includes('wc') ||
            lowerAmenity.includes('nhà vệ sinh')
        )
            return faToilet;
        if (
            lowerAmenity.includes('tủ quần áo') ||
            lowerAmenity.includes('tủ áo') ||
            lowerAmenity.includes('tủ đồ') ||
            lowerAmenity.includes('quần áo')
        )
            return faShirt;
        if (lowerAmenity.includes('điện') || lowerAmenity.includes('electric')) return faBolt;
        if (
            lowerAmenity.includes('nước') ||
            lowerAmenity.includes('water') ||
            lowerAmenity.includes('vòi')
        )
            return faWater;
        if (lowerAmenity.includes('thang máy') || lowerAmenity.includes('elevator'))
            return faBuilding;
        if (lowerAmenity.includes('máy giặt') || lowerAmenity.includes('giặt')) return faWater;
        if (lowerAmenity.includes('tủ lạnh') || lowerAmenity.includes('tủ đông'))
            return faSnowflake;
        if (lowerAmenity.includes('ban công') || lowerAmenity.includes('sân thượng')) return faHome;
        return faHome;
    };

    const getSurroundingIcon = (surrounding: string) => {
        const lowerSurrounding = surrounding.toLowerCase();
        if (
            lowerSurrounding.includes('bệnh viện') ||
            lowerSurrounding.includes('y tế') ||
            lowerSurrounding.includes('phòng khám')
        )
            return faHospital;
        if (
            lowerSurrounding.includes('trường') ||
            lowerSurrounding.includes('học') ||
            lowerSurrounding.includes('đại học')
        )
            return faSchool;
        if (
            lowerSurrounding.includes('chợ') ||
            lowerSurrounding.includes('siêu thị') ||
            lowerSurrounding.includes('market')
        )
            return faCartShopping;
        if (
            lowerSurrounding.includes('xe buýt') ||
            lowerSurrounding.includes('bến xe') ||
            lowerSurrounding.includes('bus')
        )
            return faBus;
        if (
            lowerSurrounding.includes('quán ăn') ||
            lowerSurrounding.includes('nhà hàng') ||
            lowerSurrounding.includes('food')
        )
            return faUtensils;
        if (
            lowerSurrounding.includes('cửa hàng') ||
            lowerSurrounding.includes('tiện lợi') ||
            lowerSurrounding.includes('convenience')
        )
            return faStore;
        if (
            lowerSurrounding.includes('công ty') ||
            lowerSurrounding.includes('văn phòng') ||
            lowerSurrounding.includes('office')
        )
            return faBuilding;
        if (lowerSurrounding.includes('công viên') || lowerSurrounding.includes('park'))
            return faLocationDot;
        if (
            lowerSurrounding.includes('gym') ||
            lowerSurrounding.includes('thể thao') ||
            lowerSurrounding.includes('fitness')
        )
            return faLocationDot;
        return faLocationDot;
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllImages, setShowAllImages] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [reviews, setReviews] = useState<ListingReview[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const currentUser =
        typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const { checkIsFavorited, toggleFavorite: contextToggleFavorite } = useFavorites();

    useEffect(() => {
        fetchListingDetail();
        fetchReviews();
        checkFavoriteStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px là breakpoint md của Tailwind
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkFavoriteStatus = async () => {
        if (!token) return;
        try {
            const favorited = await checkIsFavorited(listingId);
            setIsFavorite(favorited);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleShareToFacebook = () => {
        const shareUrl = (process.env.NEXT_PUBLIC_SHARE_URL || '') || API_URL;
        const ogUrl = `${shareUrl}/og/listing/${id}`;
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            ogUrl
        )}`;
        window.open(facebookShareUrl, '_blank', 'width=600,height=400');
    };

    const handleToggleFavorite = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập để thêm vào yêu thích');
            return;
        }

        setFavoriteLoading(true);
        try {
            const newState = await contextToggleFavorite(listingId);
            setIsFavorite(newState);
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleOpenReportModal = () => {
        if (!token) {
            alert('Vui lòng đăng nhập để báo cáo');
            return;
        }
        setIsReportModalOpen(true);
    };

    const fetchListingDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/listings/${listingId}`);
            const data = await response.json();

            if (data.success) {
                setListing(data.data);
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath?: string | null): string => {
        if (!imagePath) return '/default-image.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/reviews/listing/${listingId}`);
            if (response.data.success) {
                setReviews(response.data.data.reviews);
                setAvgRating(response.data.data.avgRating);
                setTotalReviews(response.data.data.totalReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!token) {
            alert('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (userRating === 0) {
            alert('Vui lòng chọn số sao đánh giá');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/reviews`,
                {
                    listingId,
                    rating: userRating,
                    comment: userComment,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                alert('Đánh giá thành công!');
                setUserRating(0);
                setUserComment('');
                fetchReviews();
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            alert(message || 'Lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: EntityId): Promise<void> => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

        try {
            const response = await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('Xóa đánh giá thành công');
                fetchReviews();
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            alert(message || 'Lỗi khi xóa đánh giá');
        }
    };

    const getYouTubeEmbedUrl = (url?: string | null): string => {
        if (!url) return '';

        if (url.includes('/embed/')) return url;

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
            /youtube\.com\/embed\/([^&\s]+)/,
            /youtube\.com\/v\/([^&\s]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://www.youtube.com/embed/${match[1]}?autoplay=0`;
            }
        }

        return url;
    };

    const openLightbox = (index: number): void => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'unset';
    };

    const nextImage = () => {
        setDirection(1);
        setLightboxIndex(prev => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setDirection(-1);
        setLightboxIndex(prev => (prev - 1 + images.length) % images.length);
    };

    const nextCarouselImage = () => {
        setDirection(1);
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    };

    const prevCarouselImage = () => {
        setDirection(-1);
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const handleKeyPress = (e: globalThis.KeyboardEvent): void => {
            if (!isLightboxOpen) return;

            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLightboxOpen]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Không tìm thấy tin đăng
                    </h2>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Quay về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const images: string[] = listing.images?.length
        ? listing.images
        : listing.image
        ? [listing.image]
        : [];
    const displayedImages = showAllImages ? images : images.slice(0, 5);

    const parseStringList = (value: string[] | string | undefined): string[] => {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        try {
            const parsed: unknown = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
        } catch {
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
    };

    const amenities = parseStringList(listing.amenities);

    const surroundings = parseStringList(listing.surroundings);

    const fadeVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const lightboxVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const mainImage = images && images.length > 0 ? getImageUrl(images[0]) : '';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <>
            <Helmet>
                <title>{listing.title} - Phongtro247</title>
                <meta name="description" content={listing.description || listing.title} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={listing.title} />
                <meta property="og:description" content={listing.description || listing.title} />
                <meta property="og:image" content={mainImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={pageUrl} />
                <meta property="twitter:title" content={listing.title} />
                <meta
                    property="twitter:description"
                    content={listing.description || listing.title}
                />
                <meta property="twitter:image" content={mainImage} />
            </Helmet>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-[72px]">
                <div className="py-5">
                    <Breadcrumb
                        customTitle={listing.title}
                        categorySlug={listing.typeSlug}
                        categoryName={listing.type}
                    />
                </div>

                <div className="overflow-hidden">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-2 flex-wrap">
                                {listing.isHot && (
                                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                        Hot
                                    </span>
                                )}
                                <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    {listing.type}
                                </span>
                                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    {listing.location}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleShareToFacebook}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                    title="Chia sẻ lên Facebook"
                                >
                                    <FontAwesomeIcon
                                        icon={faShareNodes}
                                        className="text-gray-600"
                                    />
                                </button>
                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                    className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
                                    title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                >
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        className={isFavorite ? 'text-red-500' : 'text-gray-600'}
                                    />
                                </button>
                                <button
                                    onClick={handleOpenReportModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                    title="Báo cáo sự cố"
                                >
                                    <FontAwesomeIcon icon={faFlag} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-3">{listing.title}</h1>

                        <div className="flex items-center text-gray-600 mb-4">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-2" />
                            <span className="text-sm">{listing.address}</span>
                        </div>

                        <div className="block md:hidden mb-4">
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[300px]">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={getImageUrl(images[currentImageIndex])}
                                        alt="Main"
                                        variants={fadeVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{
                                            duration: 0.1,
                                        }}
                                        className="absolute w-full h-full object-cover cursor-pointer"
                                        onClick={() => openLightbox(currentImageIndex)}
                                        onError={e => {
                                            e.currentTarget.src =
                                                'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image';
                                        }}
                                    />
                                </AnimatePresence>
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevCarouselImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 z-10 cursor-pointer"
                                        >
                                            <FontAwesomeIcon
                                                icon={faChevronLeft}
                                                className="text-3xl font-extrabold text-gray-100"
                                            />
                                        </button>
                                        <button
                                            onClick={nextCarouselImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 z-10 cursor-pointer"
                                        >
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                                className="text-3xl font-extrabold text-gray-100"
                                            />
                                        </button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Video for mobile */}
                        {listing.hasVideo && listing.videoUrl && isMobile && (
                            <div className="block md:hidden mb-4">
                                <div
                                    className="bg-black rounded-lg overflow-hidden relative"
                                    style={{ height: '250px' }}
                                >
                                    <iframe
                                        key="mobile-video"
                                        src={getYouTubeEmbedUrl(listing.videoUrl)}
                                        title="Video giới thiệu"
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        frameBorder="0"
                                    />
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                        <FontAwesomeIcon icon={faVideo} />
                                        VIDEO
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className={`hidden md:grid gap-3 mb-4 ${
                                listing.hasVideo && listing.videoUrl
                                    ? 'md:grid-cols-5'
                                    : 'md:grid-cols-5'
                            }`}
                        >
                            {/* 2 ảnh bên trái - nằm ngang (trên dưới) */}
                            <div
                                className={
                                    listing.hasVideo && listing.videoUrl
                                        ? 'md:col-span-2 grid grid-rows-2 gap-3'
                                        : 'md:col-span-2 grid grid-rows-2 gap-3'
                                }
                                style={{ height: '500px' }}
                            >
                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg group relative">
                                    <img
                                        src={getImageUrl(displayedImages[0])}
                                        alt="Image 1"
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onClick={() => openLightbox(0)}
                                        onError={e => {
                                            e.currentTarget.src =
                                                'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg group relative">
                                    <img
                                        src={getImageUrl(displayedImages[1])}
                                        alt="Image 2"
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onClick={() => openLightbox(1)}
                                        onError={e => {
                                            e.currentTarget.src =
                                                'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image';
                                        }}
                                    />
                                </div>
                            </div>

                            {listing.hasVideo && listing.videoUrl && (
                                <div className="grid grid-rows-3 gap-3" style={{ height: '500px' }}>
                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[2])}
                                            alt="Image 3"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(2)}
                                            onError={e => {
                                                e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                    </div>

                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[3])}
                                            alt="Image 4"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(3)}
                                            onError={e => {
                                                e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                    </div>

                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[4])}
                                            alt="Image 5"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(4)}
                                            onError={e => {
                                                e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                        {images.length > 5 && (
                                            <button
                                                onClick={() => openLightbox(4)}
                                                className="absolute inset-0 bg-black/70 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-black/80 transition cursor-pointer flex flex-col items-center justify-center gap-1"
                                            >
                                                <span className="text-3xl">
                                                    +{images.length - 5}
                                                </span>
                                                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                                                    Xem tất cả
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Video chiếm full 2 cột bên phải nếu có */}
                            {listing.hasVideo && listing.videoUrl && !isMobile && (
                                <div
                                    className="md:col-span-2 bg-black rounded-2xl overflow-hidden shadow-lg relative group"
                                    style={{ height: '500px' }}
                                >
                                    <iframe
                                        key="desktop-video"
                                        src={getYouTubeEmbedUrl(listing.videoUrl)}
                                        title="Video giới thiệu"
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        frameBorder="0"
                                    />
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                        <FontAwesomeIcon icon={faVideo} />
                                        VIDEO
                                    </div>
                                </div>
                            )}

                            {/* 3 ảnh bên phải nếu KHÔNG có video */}
                            {!listing.hasVideo && (
                                <div
                                    className="md:col-span-3 grid grid-rows-3 gap-3"
                                    style={{ height: '500px' }}
                                >
                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[2])}
                                            alt="Image 3"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(2)}
                                            onError={e => {
                                            e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                    </div>

                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[3])}
                                            alt="Image 4"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(3)}
                                            onError={e => {
                                            e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                    </div>

                                    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md group relative">
                                        <img
                                            src={getImageUrl(displayedImages[4])}
                                            alt="Image 5"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                            onClick={() => openLightbox(4)}
                                            onError={e => {
                                            e.currentTarget.src = 'https://placehold.co/600x400';
                                            }}
                                        />
                                        {images.length > 5 && (
                                            <button
                                                onClick={() => openLightbox(4)}
                                                className="absolute inset-0 bg-black/70 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-black/80 transition cursor-pointer flex flex-col items-center justify-center gap-1"
                                            >
                                                <span className="text-3xl">
                                                    +{images.length - 5}
                                                </span>
                                                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                                                    Xem tất cả
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 mt-6">
                        {/* Price & Contact Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div className="text-[20px] font-bold text-orange-500">
                                    <p className="text-[13px] text-[#999]">Giá chỉ từ</p>
                                    <p>{listing.price}</p>
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${listing.owner?.phone ?? ''}`}
                                        className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-sm text-white font-semibold p-[10px] rounded-md transition flex items-center justify-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faPhone} />
                                        Liên hệ chủ trọ
                                    </a>
                                    <a
                                        href={`https://zalo.me/${listing.owner?.phone ?? ''}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-blue-500 cursor-pointer text-sm hover:bg-blue-600 text-white font-semibold p-[10px] rounded-md transition flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 48 48"
                                            width="20px"
                                            height="20px"
                                        >
                                            <path
                                                fill="#2962ff"
                                                d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10 c4.722,0,8.883-2.348,11.417-5.931V36H15z"
                                            />
                                            <path
                                                fill="#eee"
                                                d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19 c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742 c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083 C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"
                                            />
                                            <path
                                                fill="#2962ff"
                                                d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75 S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"
                                            />
                                            <path
                                                fill="#2962ff"
                                                d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"
                                            />
                                            <path
                                                fill="#2962ff"
                                                d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75 S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5 c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"
                                            />
                                            <path
                                                fill="#2962ff"
                                                d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5 c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"
                                            />
                                        </svg>
                                        Zalo
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faHome} className="text-blue-600" />
                                    <span className="text-sm text-gray-600">{listing.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faRulerCombined}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm text-gray-600">{listing.area}</span>
                                </div>
                                {listing.roomCount && (
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBed} className="text-blue-600" />
                                        <span className="text-sm text-gray-600">
                                            Số lượng: {listing.roomCount} phòng
                                        </span>
                                    </div>
                                )}
                                {listing.owner && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-600">
                                                Chủ trọ: {listing.owner.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faPhone}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-600">
                                                {listing.owner.phone}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {listing.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faCalendar}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Ngày đăng:{' '}
                                            {new Date(listing.createdAt).toLocaleDateString(
                                                'vi-VN'
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">Giới thiệu</h2>
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                                {listing.description || 'Chưa có mô tả'}
                            </div>
                        </div>

                        {/* Tiện nghi */}
                        {amenities.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">Tiện nghi</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                    {amenities.map((item, idx) => {
                                        const icon = getAmenityIcon(item);
                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <FontAwesomeIcon
                                                    icon={icon}
                                                    className="text-gray-700 text-sm w-4"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Môi trường xung quanh */}
                        {surroundings.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">Môi trường xung quanh</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                    {surroundings.map((item, idx) => {
                                        const icon = getSurroundingIcon(item);
                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <FontAwesomeIcon
                                                    icon={icon}
                                                    className="text-gray-700 text-sm w-4"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        {listing.rules && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-4">Nội quy</h2>
                                <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                                    {listing.rules}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-6 text-white">
                                <h2 className="text-[20px] font-bold mb-2">
                                    Đánh giá từ khách thuê
                                </h2>
                                <p className="text-orange-100 text-sm">
                                    Chia sẻ trải nghiệm của bạn
                                </p>
                            </div>

                            <div>
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xl font-black bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-transparent">
                                                    {avgRating.toFixed(1)}
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 justify-center">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FontAwesomeIcon
                                                            key={star}
                                                            icon={faStar}
                                                            className={`text-sm ${
                                                                star <= avgRating
                                                                    ? 'text-orange-500'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="border-l-2 border-orange-200 pl-6">
                                                <p className="text-xl font-bold text-gray-800">
                                                    {totalReviews}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Lượt đánh giá
                                                </p>
                                            </div>
                                        </div>
                                        {totalReviews > 0 && (
                                            <div className="hidden md:block">
                                                <div className="bg-white rounded-xl px-6 py-3 shadow-md">
                                                    <p className="text-sm text-gray-600">
                                                        Chất lượng
                                                    </p>
                                                    <p className="text-lg font-bold text-orange-500">
                                                        {avgRating >= 4.5
                                                            ? 'Xuất sắc'
                                                            : avgRating >= 4
                                                            ? 'Tốt'
                                                            : avgRating >= 3
                                                            ? 'Khá'
                                                            : 'Trung bình'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Review Form */}
                                {token && (
                                    <form onSubmit={handleSubmitReview} className="mb-6 p-6">
                                        <h3 className="font-semibold mb-3">
                                            Viết đánh giá của bạn
                                        </h3>
                                        <div className="mb-3">
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setUserRating(star)}
                                                        className="text-xl cursor-pointer focus:outline-none"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faStar}
                                                            className={
                                                                star <= userRating
                                                                    ? 'text-orange-500'
                                                                    : 'text-gray-300'
                                                            }
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-2">
                                                Nhận xét (tùy chọn)
                                            </label>
                                            <textarea
                                                value={userComment}
                                                onChange={e => setUserComment(e.target.value)}
                                                className="w-full border border-gray-400 text-sm rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={8}
                                                placeholder="Chia sẻ trải nghiệm của bạn..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || userRating === 0}
                                            className="bg-blue-600 text-white px-6 py-2 text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </button>
                                    </form>
                                )}

                                {/* Reviews List */}
                                <div className="space-y-4 p-6">
                                    {reviews.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-4">
                                            Chưa có đánh giá nào.
                                        </p>
                                    ) : (
                                        reviews.map(review => (
                                            <div
                                                key={review.id}
                                                className="border-b pb-4 last:border-0"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {review.user_name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {review.user_name}
                                                            </p>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <FontAwesomeIcon
                                                                        key={star}
                                                                        icon={faStar}
                                                                        className={`text-[10px] ${
                                                                            star <= review.rating
                                                                                ? 'text-orange-500'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(
                                                                 review.created_at || ''
                                                            ).toLocaleDateString('vi-VN')}
                                                        </span>
                                                        {currentUser.id === review.user_id && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteReview(review.id)
                                                                }
                                                                className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm ml-8 w-fit py-1 px-8 rounded-full bg-gray-200">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">Đường đi</h2>

                            <div className="w-full h-80 rounded-lg overflow-hidden">
                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                         listing.address || ''
                                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                ></iframe>
                            </div>

                            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    className="mt-1 text-blue-600"
                                />
                                <p>{listing.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={lightboxVariants}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:text-gray-300 transition z-10 cursor-pointer bg-black/30 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xl md:text-2xl" />
                        </button>

                        <div className="absolute top-2 left-2 md:top-4 md:left-4 text-white text-sm md:text-lg font-semibold z-10 bg-black/30 px-3 py-1 rounded-full">
                            {lightboxIndex + 1} / {images.length}
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 text-white cursor-pointer hover:text-gray-300 transition z-10 bg-black/50 rounded-full p-4"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} className="text-2xl" />
                                </button>

                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-10 bg-black/50 rounded-full p-4 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} className="text-2xl " />
                                </button>
                            </>
                        )}

                        <div
                            className="relative w-full max-w-5xl h-[60vh] md:h-[70vh] mx-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={lightboxIndex}
                                    src={getImageUrl(images[lightboxIndex])}
                                    alt={`Image ${lightboxIndex + 1}`}
                                    variants={fadeVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                        duration: 0.08,
                                    }}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    onError={e => {
                                        e.currentTarget.src =
                                            'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image';
                                    }}
                                />
                            </AnimatePresence>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-3 z-10"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                                    </button>

                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-3 z-10"
                                    >
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className="text-lg"
                                        />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center gap-2 px-4 overflow-x-auto">
                            {images.slice(0, 10).map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setDirection(idx > lightboxIndex ? 1 : -1);
                                        setLightboxIndex(idx);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 cursor-pointer border-2 rounded-lg overflow-hidden transition ${
                                        idx === lightboxIndex
                                            ? 'border-white'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`Thumb ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {images.length > 10 && (
                                <div className="flex-shrink-0 w-16 h-16 bg-black/50 border-2 border-transparent rounded-lg flex items-center justify-center text-white text-xs">
                                    +{images.length - 10}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                listingId={listingId}
            />
        </>
    );
};

export default ListingDetail;
