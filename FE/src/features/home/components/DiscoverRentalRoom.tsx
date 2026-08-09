/* eslint-disable no-unused-vars */
import { faPlay, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, type MouseEvent, type SyntheticEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { Link } from '@/lib/navigation/router-compat';
import type { EntityId, ListingLocation, VideoListing } from '@/types';

const DiscoverRentalRoom = () => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || 'http://localhost:5000';
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [videosPerView, setVideosPerView] = useState(5);
    const [videos, setVideos] = useState<VideoListing[]>([]);
    const [locations, setLocations] = useState<ListingLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<EntityId | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/locations`);
                if (response.data.success) {
                    setLocations(response.data.data.slice(0, 6));
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchVideoListings = async () => {
            setLoading(true);
            try {
                const params: { limit: number; location_id?: EntityId } = { limit: 10 };
                if (selectedLocation) {
                    params.location_id = selectedLocation;
                }
                const response = await axios.get(`${API_URL}/api/listings/videos`, { params });
                if (response.data.success) {
                    setVideos(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching video listings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideoListings();
    }, [selectedLocation]);

    const getVideoId = (url?: string | null): string | null => {
        if (!url) return null;
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\\/ ]{11})/
        );
        return match ? match[1] : null;
    };

    const getEmbedUrl = (url?: string | null): string | null => {
        if (!url) return null;
        const match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
    };

    const getImageUrl = (imagePath?: string | null): string => {
        if (!imagePath) return 'https://placehold.co/600x400';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const closeVideoModal = (e?: MouseEvent<HTMLDivElement | HTMLButtonElement>): void => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsClosing(true);
        setTimeout(() => {
            setActiveVideo(null);
            setIsClosing(false);
        }, 300);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 600) {
                setVideosPerView(1);
            } else if (window.innerWidth < 768) {
                setVideosPerView(2);
            } else if (window.innerWidth < 1024) {
                setVideosPerView(3);
            } else if (window.innerWidth < 1536) {
                setVideosPerView(4);
            } else {
                setVideosPerView(5);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || videos.length === 0) return;

        let scrollInterval: ReturnType<typeof setInterval> | undefined;
        let isPaused = false;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (!isPaused && container) {
                    container.scrollLeft += 3;

                    const halfWidth = container.scrollWidth / 2;
                    if (container.scrollLeft >= halfWidth) {
                        container.scrollLeft = 0;
                    }
                }
            }, 20);
        };

        const handleMouseEnter = () => {
            isPaused = true;
        };

        const handleMouseLeave = () => {
            isPaused = false;
        };

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        startAutoScroll();

        return () => {
            clearInterval(scrollInterval);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [videos]);

    const videoWidth = `calc(${100 / videosPerView}% - ${
        (videosPerView - 1) * 0.8
    }rem / ${videosPerView})`;

    return (
        <div className="bg-[#0045a8] py-10 flex flex-col items-center gap-y-4">
            <h3 className="text-white text-lg md:text-2xl font-[700] uppercase text-center">
                Trải nghiệm trọ mới tại các địa điểm ở Hà Nội
            </h3>
            <ul className="flex gap-x-4 gap-y-4 text-white flex-wrap justify-center">
                <Link to="/videos">
                    <li
                        className={`cursor-pointer sm:py-2 sm:px-3 py-[6px] px-2 transition-colors duration-300 text-sm rounded-sm ${
                            selectedLocation === null
                                ? 'bg-[#00b7ff] text-white'
                                : 'bg-white text-[#2e2a2a] hover:text-[#00b7ff]'
                        }`}
                    >
                        Tất cả
                    </li>
                </Link>
                {locations.map(location => (
                    <Link key={location.id} to={`/videos?location=${location.id}`}>
                        <li
                            className={`cursor-pointer sm:py-2 sm:px-3 py-[6px] px-2 transition-colors duration-300 text-sm rounded-sm ${
                                selectedLocation === location.id
                                    ? 'bg-[#00b7ff] text-white'
                                    : 'bg-white text-[#2e2a2a] hover:text-[#00b7ff]'
                            }`}
                        >
                            {location.name}
                        </li>
                    </Link>
                ))}
            </ul>

            <div className="w-full overflow-hidden 2xl:px-40 xl:px-20 px-10 mt-5 scrollbar-thin">
                {loading ? (
                    <div className="text-white text-center py-10">Đang tải...</div>
                ) : videos.length === 0 ? (
                    <div className="text-white text-center py-10">Chưa có video nào</div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-5 pb-4 overflow-x-auto list-video"
                        style={{
                            scrollBehavior: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {[...videos, ...videos].map((v, index) => {
                            const videoId = getVideoId(v.videoUrl);
                            return (
                                <div
                                    key={`video-${index}`}
                                    style={{ width: videoWidth, minWidth: videoWidth }}
                                    className="bg-white rounded-xl shadow-lg flex-shrink-0 overflow-hidden hover:shadow-xl transition"
                                >
                                    <div
                                        className="w-full flex items-center justify-center relative group cursor-pointer p-2"
                                        style={{ height: '400px' }}
                                        onClick={() => {
                                            setActiveVideo(v.videoUrl ?? null);
                                        }}
                                    >
                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-200 to-gray-500 relative group overflow-hidden">
                                            <img
                                                src={
                                                    videoId
                                                        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                                                        : getImageUrl(v.image)
                                                }
                                                alt="video thumbnail"
                                                className="w-full h-full object-cover"
                                                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                    if (videoId) {
                                                        e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                    } else {
                                                        e.currentTarget.src = getImageUrl(v.image);
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                                            <div className="text-white absolute bottom-4 left-4 border-2 flex items-center justify-center py-[9px] px-[7px] rounded-full w-fit group-hover:scale-130 transition-transform duration-500">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col gap-y-2">
                                        <p className="flex items-center gap-x-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7.28205 0C3.81795 0 1 2.81795 1 6.28205C1 9.95651 4.3722 12.1836 6.60358 13.6575L6.98338 13.9096C7.07385 13.9699 7.17795 14 7.28205 14C7.38615 14 7.49026 13.9699 7.58072 13.9096L7.96052 13.6575C10.1919 12.1836 13.5641 9.95651 13.5641 6.28205C13.5641 2.81795 10.7462 0 7.28205 0ZM7.36749 12.7587L7.28205 12.8155L7.19661 12.7587C5.03559 11.3314 2.07692 9.37713 2.07692 6.28205C2.07692 3.41169 4.41169 1.07692 7.28205 1.07692C10.1524 1.07692 12.4872 3.41169 12.4872 6.28205C12.4872 9.37713 9.5278 11.3321 7.36749 12.7587ZM7.28205 3.94872C5.99549 3.94872 4.94872 4.99549 4.94872 6.28205C4.94872 7.56862 5.99549 8.61539 7.28205 8.61539C8.56862 8.61539 9.61539 7.56862 9.61539 6.28205C9.61539 4.99549 8.56862 3.94872 7.28205 3.94872ZM7.28205 7.53846C6.58923 7.53846 6.02564 6.97487 6.02564 6.28205C6.02564 5.58923 6.58923 5.02564 7.28205 5.02564C7.97487 5.02564 8.53846 5.58923 8.53846 6.28205C8.53846 6.97487 7.97487 7.53846 7.28205 7.53846Z"
                                                    fill="currentColor"
                                                ></path>
                                            </svg>
                                            <span className="text-[13px] text-gray-600">
                                                {v.location}
                                            </span>
                                        </p>
                                        <Link to={`/listing/${v.id}`}>
                                            <h4 className="font-[500] cursor-pointer text-[14px] sm:text-[16px] text-[#2e2a2a] one-line hover:text-[#0045a8]">
                                                {v.title}
                                            </h4>
                                        </Link>
                                        <p className="text-[#ff5c00] text-[15px] font-semibold">
                                            {v.price}
                                        </p>
                                        <div className="flex w-fit rounded-sm items-center gap-x-2 py-[2px] px-2 bg-[#f4f4f4]">
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className="text-[#ff5c00]"
                                            />
                                            <span>
                                                {v.rating || '0.0'}{' '}
                                                {(v.reviewCount ?? 0) > 0 ? `(${v.reviewCount})` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Link to="/videos">
                <button className="mt-6 px-[13px] cursor-pointer text-sm py-[11px] bg-white text-[#0045a8] hover:bg-[#00b7ff] hover:text-white font-semibold rounded transition-colors duration-300">
                    Xem thêm nhiều hơn
                </button>
            </Link>

            {activeVideo && (
                <div
                    className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${
                        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                    }`}
                    onClick={closeVideoModal}
                >
                    <div
                        className={`relative bg-white rounded-lg overflow-hidden w-full max-w-3xl shadow-2xl ${
                            isClosing ? 'animate-slideDown' : 'animate-slideUp'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 cursor-pointer text-gray-600 text-2xl z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition"
                            onClick={closeVideoModal}
                        >
                            <FaTimes />
                        </button>

                        <div className="p-4">
                            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-4">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={getEmbedUrl(activeVideo) || activeVideo}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Video đang phát
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Bạn có thể xem video trực tiếp tại{' '}
                                    <a
                                        href={getEmbedUrl(activeVideo) || activeVideo || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        đây
                                    </a>
                                </p>
                            </div>

                            <button
                                onClick={closeVideoModal}
                                className="w-full px-4 py-2 cursor-pointer bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoverRentalRoom;
