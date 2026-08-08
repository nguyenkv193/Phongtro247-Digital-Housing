import { useState, type MouseEvent, type SyntheticEvent } from 'react';
import axios from 'axios';
import { Link } from '@/lib/navigation/router-compat';
import { hot } from '@/assets/assets';
import { useFavorites } from '@/providers/FavoritesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { VideoListing } from '@/types';

interface ListingCardProps {
    listing: VideoListing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175') || 'http://localhost:5175';

    const { toggleFavorite, favoritesList } = useFavorites();

    const isFavorited = favoritesList.some(item => item.id === listing.id);

    const [isProcessing, setIsProcessing] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleToggleFavorite = async (e: MouseEvent<SVGSVGElement>): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            alert('Vui lòng đăng nhập để lưu tin đăng');
            return;
        }

        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await toggleFavorite(listing.id);
        } catch (error: unknown) {
            console.error('Lỗi khi thao tác yêu thích:', error);
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            alert(message || 'Có lỗi xảy ra');
        } finally {
            setIsProcessing(false);
        }
    };

    const getImageUrl = (imagePath?: string | null): string => {
        if (!imagePath) return '/default-image.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const handleVideoClick = (e: MouseEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setShowVideoModal(true);
    };

    const closeVideoModal = (e: MouseEvent<HTMLDivElement | HTMLButtonElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsClosing(true);
        setTimeout(() => {
            setShowVideoModal(false);
            setIsClosing(false);
        }, 300);
    };

    const getEmbedUrl = (url?: string | null): string => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.match(
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
            )?.[1];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        return url;
    };

    return (
        <div className="flex sm:flex-col border border-gray-200 rounded-md sm:border-none">
            <div className="flex-1 relative">
                {listing.isHot && (
                    <div className="absolute top-3 -left-[3px] z-10">
                        <div className="relative w-16">
                            <img src={hot} alt="tag-hot" className="w-full h-full" />
                            <span className="absolute top-[10px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">
                                HOT
                            </span>
                        </div>
                    </div>
                )}
                {listing.hasVideo && (
                    <div className="absolute bottom-3 left-3 z-10" onClick={handleVideoClick}>
                        <div className="bg-white text-black px-[2px] sm:px-2 py-1 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                            <FontAwesomeIcon
                                icon={faCirclePlay}
                                className="text-blue-500 text-base"
                            />
                            <span className="text-xs font-semibold hidden sm:inline">Review</span>
                        </div>
                    </div>
                )}
                <Link to={`/listing/${listing.id}`}>
                    <div className="overflow-hidden aspect-[1/1] sm:aspect-[4/3] w-full h-full cursor-pointer">
                        <img
                            src={getImageUrl(listing.image)}
                            alt={listing.title}
                            className="w-full h-full rounded-tl-md rounded-bl-md sm:rounded-tr-md md:rounded-br-md object-cover object-center"
                            onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                if (!e.currentTarget.dataset.fallback) {
                                    e.currentTarget.dataset.fallback = 'true';
                                    e.currentTarget.src = 'https://placehold.co/600x400';
                                }
                            }}
                        />
                    </div>
                </Link>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={isFavorited ? 'currentColor' : '#00000080'}
                    stroke="white"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    role="presentation"
                    focusable="false"
                    onClick={handleToggleFavorite}
                    style={{ display: 'block', strokeWidth: 2, overflow: 'visible' }}
                    className={`w-6 h-6 absolute bottom-2 right-2 cursor-pointer transition-all duration-300 ${
                        isProcessing ? 'opacity-50' : 'hover:scale-110'
                    } ${isFavorited && 'text-red-500'}`}
                >
                    <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                </svg>
            </div>
            <div className="flex-2 sm:flex-1 flex flex-col gap-y-2 sm:p-2 p-4 bg-[#f8f8f8] sm:rounded-bl-md rounded-tr-md sm:rounded-tr-none rounded-br-md">
                <Link to={`/listing/${listing.id}`}>
                    <h3 className="text-[#2e2a2a] text-sm font-semibold one-line cursor-pointer hover:text-[#0045a8]">
                        {listing.title}
                    </h3>
                </Link>
                <div>
                    <sup className="mr-2 text-[#999] font-light text-[10px] lg:text-[13px]">Từ</sup>
                    <span className="text-[#ff5c00] text-[13px] sm:text-[16px] font-semibold">
                        {listing.price}
                    </span>
                </div>
                <div className="flex items-center gap-x-2">
                    <span className="font-[500] text-[10px] sm:text-[13px] whitespace-nowrap px-1 py-[6px] sm:px-2 sm:py-[6px] bg-[#f4f4f4] text-[#2e2a2a] rounded-sm cursor-pointer">
                        {listing.type}
                    </span>
                    <span className="font-[500] text-[10px] sm:text-[13px] whitespace-nowrap px-1 py-[6px] sm:px-2 sm:py-[6px] bg-[#f4f4f4] text-[#2e2a2a] rounded-sm cursor-pointer">
                        {listing.area}
                    </span>
                </div>
                <div className="flex items-center gap-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="sm:inline-block hidden"
                    >
                        <path
                            d="M7.28205 0C3.81795 0 1 2.81795 1 6.28205C1 9.95651 4.3722 12.1836 6.60358 13.6575L6.98338 13.9096C7.07385 13.9699 7.17795 14 7.28205 14C7.38615 14 7.49026 13.9699 7.58072 13.9096L7.96052 13.6575C10.1919 12.1836 13.5641 9.95651 13.5641 6.28205C13.5641 2.81795 10.7462 0 7.28205 0ZM7.36749 12.7587L7.28205 12.8155L7.19661 12.7587C5.03559 11.3314 2.07692 9.37713 2.07692 6.28205C2.07692 3.41169 4.41169 1.07692 7.28205 1.07692C10.1524 1.07692 12.4872 3.41169 12.4872 6.28205C12.4872 9.37713 9.5278 11.3321 7.36749 12.7587ZM7.28205 3.94872C5.99549 3.94872 4.94872 4.99549 4.94872 6.28205C4.94872 7.56862 5.99549 8.61539 7.28205 8.61539C8.56862 8.61539 9.61539 7.56862 9.61539 6.28205C9.61539 4.99549 8.56862 3.94872 7.28205 3.94872ZM7.28205 7.53846C6.58923 7.53846 6.02564 6.97487 6.02564 6.28205C6.02564 5.58923 6.58923 5.02564 7.28205 5.02564C7.97487 5.02564 8.53846 5.58923 8.53846 6.28205C8.53846 6.97487 7.97487 7.53846 7.28205 7.53846Z"
                            fill="currentColor"
                        ></path>
                    </svg>
                    <span className="text-[#2e2a2a] font-light text-xs sm:text-[13px] one-line ">
                        {listing.location}
                    </span>
                </div>
            </div>

            {showVideoModal && listing.videoUrl && (
                <div
                    className={`fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 ${
                        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                    }`}
                    onClick={closeVideoModal}
                >
                    <div
                        className={`relative bg-black rounded-lg w-full max-w-sm aspect-[9/16] ${
                            isClosing ? 'animate-slideDown' : 'animate-slideUp'
                        }`}
                        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeVideoModal}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-3xl" />
                        </button>
                        <iframe
                            src={getEmbedUrl(listing.videoUrl)}
                            className="w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video Review"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingCard;
