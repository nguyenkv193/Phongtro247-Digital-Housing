import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Link } from '@/lib/navigation/router-compat';
import ListingCard from './ListingCard';
import type { VideoListing } from '@/types';

interface RentalListingProps {
    title: string;
    listings?: VideoListing[];
    viewAllLink?: string;
    loading?: boolean;
}

const RentalListing = ({ title, listings = [], viewAllLink, loading = false }: RentalListingProps) => {

    return (
        <div className="px-2 py-5 sm:p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md">
            {/* Title */}
            <h3 className="text-[#0045a8] md:text-2xl font-bold uppercase mb-6 text-[18px]">
                {title}
            </h3>

            {/* Loading State */}
            {loading ? (
                <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[4/3] rounded-md mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-200 rounded flex-1"></div>
                                <div className="h-6 bg-gray-200 rounded flex-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : listings && listings.length > 0 ? (
                <>
                    {/* List Hostel */}
                    <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>

                    {/* View All Button */}
                    {viewAllLink && (
                        <Link to={viewAllLink}>
                            <div className="mt-8 sm:mt-12 text-[#0045a8] hover:text-[#00b7ff] border border-[#0045a8] hover:border-[#00b7ff] px-[13px] py-[9px] rounded-sm flex sm:inline-flex items-center justify-center gap-x-2 cursor-pointer transition-colors whitespace-nowrap duration-300">
                                <span className="text-sm font-semibold">Xem tất cả</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                            </div>
                        </Link>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-gray-300 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">Chưa có tin đăng</h4>
                    <p className="text-sm text-gray-400">
                        Hiện tại chưa có tin đăng nào trong mục này
                    </p>
                </div>
            )}
        </div>
    );
};

export default RentalListing;
