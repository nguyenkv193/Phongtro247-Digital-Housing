/* eslint-disable no-unused-vars */
import React, { useState, useEffect, type MouseEvent, type SyntheticEvent } from 'react';
import { faAngleLeft, faAngleRight, faPlay, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaTimes } from 'react-icons/fa';
import { Link, useSearchParams } from '@/lib/navigation/router-compat';
import axios from 'axios';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import type { ListingLocation, VideoListing } from '@/types';

const VideoReview = () => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || 'http://localhost:5000';
    const [searchParams] = useSearchParams();
    const locationParam = searchParams.get('location');

    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [videos, setVideos] = useState<VideoListing[]>([]);
    const [locations, setLocations] = useState<ListingLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState(locationParam || null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isClosing, setIsClosing] = useState(false);
    const itemsPerPage = 15;

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
                const params: { limit: number; location_id?: string } = { limit: 100 };
                if (selectedLocation) {
                    params.location_id = selectedLocation;
                }
                const response = await axios.get(`${API_URL}/api/listings/videos`, { params });
                if (response.data.success) {
                    setVideos(response.data.data);
                    setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
                }
            } catch (error) {
                console.error('Error fetching video listings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideoListings();
    }, [selectedLocation]);

    useEffect(() => {
        setSelectedLocation(locationParam || null);
    }, [locationParam]);

    const getVideoId = (url?: string | null): string | null => {
        if (!url) return null;
        const bareIdMatch = /^[a-zA-Z0-9_-]{11}$/;
        if (bareIdMatch.test(url)) return url;
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.replace('www.', '');
            const vParam = parsed.searchParams.get('v');
            if (vParam && bareIdMatch.test(vParam)) return vParam;
            if (hostname === 'youtu.be') {
                const id = parsed.pathname.split('/').filter(Boolean)[0];
                if (id && bareIdMatch.test(id)) return id;
            }
            if (hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com')) {
                const parts = parsed.pathname.split('/').filter(Boolean);
                const tryParts = ['embed', 'shorts', 'v'];
                for (const key of tryParts) {
                    const idx = parts.indexOf(key);
                    if (idx !== -1 && parts[idx + 1] && bareIdMatch.test(parts[idx + 1])) {
                        return parts[idx + 1];
                    }
                }
            }
        } catch (_e) {}
        const match = String(url).match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
    };

    const getEmbedUrl = (input?: string | null): string | null => {
        if (!input) return null;
        const id = getVideoId(input);
        if (!id) return null;
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
    };

    const getImageUrl = (imagePath?: string | null): string => {
        if (!imagePath) return 'https://placehold.co/600x400?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVideos = videos.slice(startIndex, endIndex);

    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-[80px] sm:mt-[120px]">
            <div>
                <Breadcrumb />
            </div>

            <div className="w-full mt-5 p-5 shadow rounded">
                <div className="flex items-center gap-x-2 mb-1">
                    <svg
                        fill="#00b7ff"
                        width="32px"
                        height="32px"
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 100 100"
                        enable-background="new 0 0 100 100"
                        xmlSpace="preserve"
                    >
                        <path
                            d="M66.272,61.337v10.565c0,2.497-2.043,4.535-4.539,4.535H14.54c-2.496,0-4.54-2.038-4.54-4.535V28.097
                c0-2.496,2.043-4.535,4.54-4.535h47.193c2.496,0,4.539,2.038,4.539,4.535v10.432v-0.146L90,27.265v45.294L66.272,61.337z"
                        ></path>
                    </svg>
                    <p className="uppercase text-2xl text-[#0045a8] font-bold">
                        <span>Video</span> <span className="text-[#00b7ff]">Review</span>
                    </p>
                </div>
                <p className="text-sm text-[#898a8b] mb-4">
                    Khám phá ngay những thước phim trải nghiệm của{' '}
                    <strong className="text-[#00b7ff]">Phongtro247</strong> để bạn có thêm nhiều sự
                    lựa chọn tuyệt vời cho chỗ ở của mình nhé!
                </p>
                <ul className="flex gap-x-4 gap-y-4 text-white flex-wrap mb-4">
                    <Link to="/videos">
                        <li
                            className={`cursor-pointer sm:py-2 sm:px-3 py-[6px] px-2 transition-colors duration-300 text-sm rounded-sm ${
                                !selectedLocation
                                    ? 'bg-[#00b7ff] text-white'
                                    : 'bg-[#f4f4f4] text-[#2e2a2a] hover:text-[#00b7ff]'
                            }`}
                        >
                            Tất cả
                        </li>
                    </Link>
                    {locations.map(location => (
                        <Link key={location.id} to={`/videos?location=${location.id}`}>
                            <li
                                className={`cursor-pointer sm:py-2 sm:px-3 py-[6px] px-2 transition-colors duration-300 text-sm rounded-sm ${
                                    selectedLocation == location.id
                                        ? 'bg-[#00b7ff] text-white'
                                        : 'bg-[#f4f4f4] text-[#2e2a2a] hover:text-[#00b7ff]'
                                }`}
                            >
                                {location.name}
                            </li>
                        </Link>
                    ))}
                </ul>
                {loading ? (
                    <div className="text-center py-10">Đang tải...</div>
                ) : currentVideos.length === 0 ? (
                    <div className="text-center py-10">Chưa có video nào</div>
                ) : (
                    <div className="grid gap-5 justify-center sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {currentVideos.map(v => {
                            const videoId = getVideoId(v.videoUrl);
                            return (
                                <div
                                    key={v.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                                >
                                    <div
                                        className="w-full flex items-center justify-center relative group cursor-pointer"
                                        style={{ height: '420px' }}
                                        onClick={() => setActiveVideo(v.videoUrl ?? null)}
                                    >
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-500 relative group overflow-hidden">
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

                                            <div className="text-white absolute bottom-4 left-4 border-2 flex items-center justify-center py-[9px] px-[7px] rounded-full w-fit group-hover:scale-130 transition-transform duration-500">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col gap-y-2">
                                        <p className="flex items-center gap-x-2 text-gray-600 text-sm">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7.28205 0C3.81795 0 1 2.81795 1 6.28205C1 9.95651 4.3722 12.1836 6.60358 13.6575L6.98338 13.9096C7.07385 13.9699 7.17795 14 7.28205 14C7.38615 14 7.49026 13.9699 7.58072 13.9096L7.96052 13.6575C10.1919 12.1836 13.5641 9.95651 13.5641 6.28205C13.5641 2.81795 10.7462 0 7.28205 0ZM7.36749 12.7587L7.28205 12.8155L7.19661 12.7587C5.03559 11.3314 2.07692 9.37713 2.07692 6.28205C2.07692 3.41169 4.41169 1.07692 7.28205 1.07692C10.1524 1.07692 12.4872 3.41169 12.4872 6.28205C12.4872 9.37713 9.5278 11.3321 7.36749 12.7587ZM7.28205 3.94872C5.99549 3.94872 4.94872 4.99549 4.94872 6.28205C4.94872 7.56862 5.99549 8.61539 7.28205 8.61539C8.56862 8.61539 9.61539 7.56862 9.61539 6.28205C9.61539 4.99549 8.56862 3.94872 7.28205 3.94872Z"
                                                    fill="currentColor"
                                                ></path>
                                            </svg>
                                            <span className="text-[13px]">{v.location}</span>
                                        </p>
                                        <Link to={`/listing/${v.id}`}>
                                            <h4 className="font-[500] cursor-pointer text-[15px] sm:text-[16px] text-[#2e2a2a] one-line hover:text-[#0045a8]">
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

                {!loading && videos.length > 0 && (
                    <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 h-[34px] text-[13px] flex items-center justify-center bg-white cursor-pointer text-[#333] border border-[#f4f4f4] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00b7ff] hover:text-white transition"
                        >
                            <span>Đầu tiên</span>
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 w-[34px] h-[34px] text-[13px] flex items-center justify-center bg-white cursor-pointer text-[#333] border border-[#f4f4f4] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00b7ff] hover:text-white transition"
                        >
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                            const pageNum = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                            if (pageNum > totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-2 py-1 w-[34px] h-[34px] text-[13px] flex items-center justify-center cursor-pointer border rounded transition ${
                                        currentPage === pageNum
                                            ? 'bg-[#00b7ff] text-white border-[#00b7ff]'
                                            : 'bg-white text-[#333] border-[#f4f4f4] hover:bg-[#00b7ff] hover:text-white'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 w-[34px] h-[34px] text-[13px] flex items-center justify-center bg-white cursor-pointer text-[#333] border border-[#f4f4f4] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00b7ff] hover:text-white transition"
                        >
                            <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 h-[34px] text-[13px] flex items-center justify-center bg-white cursor-pointer text-[#333] border border-[#f4f4f4] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00b7ff] hover:text-white transition"
                        >
                            <span>Cuối cùng</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Popup video */}
            {activeVideo && (
                <div
                    className={`fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4 ${
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
                                    title="Video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Video đang phát
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Xem trực tiếp tại{' '}
                                    <a
                                        href={getEmbedUrl(activeVideo) || activeVideo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
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

export default VideoReview;
