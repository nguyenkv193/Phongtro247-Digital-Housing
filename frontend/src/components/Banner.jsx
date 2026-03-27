import React from 'react';
import { banner } from '../assets/assets';

const Banner = () => {
    return (
        <div className="relative">
            <img
                src={banner}
                alt="banner"
                className="aspect-[4/3] w-full sm:aspect-[3/1] object-cover object-[80%_center] sm:object-center"
            />
            <div className="absolute top-1/2 2xl:left-48 xl:left-32 lg:left-10 lg:block hidden -translate-y-1/2 w-fit">
                <p className="text-[36px] uppercase font-bold text-white mb-6">
                    Tìm nhanh, kiếm dễ <br /> Trọ Mới tại Hà Nội
                </p>
                <p className="text-white">
                    Trang thông tin và cho thuê phòng trọ nhanh chóng, hiệu quả với <br /> hơn 500
                    tin đăng mới và 30.000 lượt xem mỗi ngày
                </p>
            </div>
        </div>
    );
};

export default Banner;
