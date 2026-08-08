import React, { useState, useEffect } from 'react';
import { ads1, ads2, ads3, ads4, ads5 } from '@/assets/assets';

const Slider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const images = [ads1, ads2, ads3, ads4, ads5];
    const extendedImages = [...images, ...images, ...images];

    const updateVisibleCount = () => {
        if (window.innerWidth < 640) {
            setVisibleCount(1);
        } else if (window.innerWidth < 1024) {
            setVisibleCount(2);
        } else {
            setVisibleCount(3);
        }
    };

    useEffect(() => {
        updateVisibleCount();
        window.addEventListener('resize', updateVisibleCount);
        return () => window.removeEventListener('resize', updateVisibleCount);
    }, []);

    useEffect(() => {
        setCurrentIndex(images.length);
    }, [images.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex(prevIndex => prevIndex + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentIndex >= images.length * 2) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(images.length);
            }, 600);
        }
        if (currentIndex <= 0) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(images.length);
            }, 600);
        }
    }, [currentIndex, images.length]);

    const itemWidth = `calc((100% - ${(visibleCount - 1) * 0.5}rem) / ${visibleCount})`;

    return (
        <div className="relative w-full h-[130px] bottom-10 mx-auto overflow-hidden">
            <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg">
                <div
                    className="flex h-full"
                    style={{
                        transform: `translateX(calc(-${currentIndex} * (${itemWidth} + 0.5rem)))`,
                        transition: isTransitioning
                            ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                            : 'none',
                    }}
                >
                    {extendedImages.map((image, index) => (
                        <div
                            key={index}
                            className="h-full flex-shrink-0"
                            style={{
                                width: itemWidth,
                                marginRight: index < extendedImages.length - 1 ? '0.5rem' : '0',
                            }}
                        >
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover object-center rounded-lg shadow-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Slider;
