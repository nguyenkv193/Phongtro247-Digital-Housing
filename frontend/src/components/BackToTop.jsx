import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const BackToTop = () => {
    const [showArrowUp, setShowArrowUp] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY >= 500) {
                setShowArrowUp(true);
            } else {
                setShowArrowUp(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!showArrowUp) return null;

    return (
        <div
            className="w-[40px] h-[40px] bg-white shadow fixed right-10 sm:right-15 bottom-40 flex z-50 items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-300"
            onClick={scrollToTop}
        >
            <FontAwesomeIcon icon={faArrowUp} className="w-3 h-4 text-gray-600" />
        </div>
    );
};

export default BackToTop;
