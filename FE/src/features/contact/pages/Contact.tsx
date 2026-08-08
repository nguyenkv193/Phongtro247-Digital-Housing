import React from 'react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { mail, mess, phone, zalo } from '@/assets/assets';

const Contact = () => {
    return (
        <div className="mt-[80px] sm:mt-[120px] min-h-96 2xl:px-48 xl:px-32 md:px-10 px-[10px]">
            <div>
                <Breadcrumb />
            </div>
            <div className="p-5 shadow">
                <p className="text-[16px] sm:text-lg md:text-lg font-bold text-[#2e2a2a] mb-4 uppercase">
                    Về chúng tôi Phongtro247
                </p>
                <div className="flex flex-col gap-y-4 text-justify text-[#65676b] text-sm sm:text-[16px] leading-relaxed">
                    <p>
                        <strong>Phongtro247</strong> là nền tảng trực tuyến hàng đầu trong lĩnh vực
                        tìm kiếm và cho thuê phòng trọ tại Việt Nam, được xây dựng với mục tiêu giúp
                        người thuê và chủ trọ kết nối dễ dàng, nhanh chóng và an toàn. Chúng tôi
                        hiểu rằng việc tìm một nơi ở phù hợp không chỉ là nhu cầu ngắn hạn, mà còn
                        là một phần quan trọng trong hành trình ổn định cuộc sống và công việc của
                        mỗi người.
                    </p>
                    <p>
                        Với đội ngũ phát triển trẻ, năng động và giàu kinh nghiệm trong lĩnh vực
                        công nghệ và bất động sản, <strong>Phongtro247</strong> cam kết mang đến cho
                        người dùng một trải nghiệm tìm trọ toàn diện, minh bạch và hiệu quả. Hệ
                        thống của chúng tôi được thiết kế để tối ưu trải nghiệm người dùng — từ việc
                        đăng tin, tìm kiếm, lọc theo khu vực, giá thuê, tiện ích cho đến việc liên
                        hệ trực tiếp với chủ trọ chỉ trong vài thao tác đơn giản.
                    </p>
                    <p>
                        Sứ mệnh của chúng tôi là xây dựng một cộng đồng thuê trọ uy tín và văn minh,
                        nơi mọi thông tin đều được xác thực, rõ ràng và cập nhật thường xuyên.{' '}
                        <strong>Phongtro247</strong> không chỉ là nơi bạn tìm kiếm phòng trọ, mà còn
                        là cầu nối giúp chủ trọ quản lý thông tin hiệu quả, người thuê an tâm lựa
                        chọn nơi ở phù hợp, và đôi bên tiết kiệm tối đa thời gian cũng như chi phí.
                    </p>
                    <p>
                        Với phương châm “Nhanh chóng – Chính xác – Tin cậy”,{' '}
                        <strong>PhongTro247</strong> không ngừng cải tiến công nghệ, nâng cao chất
                        lượng dịch vụ và mở rộng phạm vi hoạt động trên toàn quốc. Chúng tôi tin
                        rằng, bằng sự tận tâm và chuyên nghiệp, Phongtro247 sẽ trở thành đối tác
                        đáng tin cậy của hàng triệu người Việt trong hành trình tìm kiếm chốn an cư
                        lý tưởng.
                    </p>
                </div>
            </div>
            <div className="p-5 mt-12">
                <p className="text-[16px] sm:text-lg font-bold text-[#2e2a2a] mb-4 uppercase">
                    Liên hệ ngay với chúng tôi
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-y-2 items-center p-5 shadow rounded-md">
                        <div className="w-[80px] h-[80px]">
                            <img src={mail} alt="mail_logo" />
                        </div>
                        <p className="font-[600] uppercase text-[#2e2a2a]">Email</p>
                        <p className="text-center text-[#65676b] text-sm">
                            Chúng tôi sẽ trả lời thắc mắc của bạn trong vòng 24 giờ.
                        </p>
                        <button className="py-2 px-4 border border-[#00b7ff] text-[#00b7ff] rounded-lg w-full mt-2 cursor-pointer hover:bg-[#00b7ff] hover:text-white transition-colors duration-300">
                            Email ngay
                        </button>
                    </div>
                    <div className="flex flex-col gap-y-2 items-center p-5 shadow rounded-md">
                        <div className="w-[80px] h-[80px]">
                            <img src={phone} alt="mail_logo" />
                        </div>
                        <p className="font-[600] uppercase text-[#2e2a2a]">Hotline 24/7</p>
                        <p className="text-center text-[#65676b] text-sm">
                            Điện thoại viên luôn sẵn sàng giải đáp các thắc mắc của bạn.
                        </p>
                        <button className="py-2 px-4 border border-[#00b7ff] text-[#00b7ff] rounded-lg w-full mt-2 cursor-pointer hover:bg-[#00b7ff] hover:text-white transition-colors duration-300">
                            Gọi ngay
                        </button>
                    </div>
                    <div className="flex flex-col gap-y-2 items-center p-5 shadow rounded-md">
                        <div className="w-[80px] h-[80px]">
                            <img src={mess} alt="mail_logo" />
                        </div>
                        <p className="font-[600] uppercase text-[#2e2a2a]">Facebook</p>
                        <p className="text-center text-[#65676b] text-sm">
                            Nhắn tin với chúng tôi trên nền tảng facebook messenger.
                        </p>
                        <button className="py-2 px-4 border border-[#00b7ff] text-[#00b7ff] rounded-lg w-full mt-2 cursor-pointer hover:bg-[#00b7ff] hover:text-white transition-colors duration-300">
                            Gửi tin nhắn
                        </button>
                    </div>
                    <div className="flex flex-col gap-y-2 items-center p-5 shadow rounded-md">
                        <div className="w-[80px] h-[80px]">
                            <img src={zalo} alt="mail_logo" />
                        </div>
                        <p className="font-[600] uppercase text-[#2e2a2a]">Zalo</p>
                        <p className="text-center text-[#65676b] text-sm">
                            Nhắn tin hoặc gọi cho chúng tôi trên nền tảng Zalo.
                        </p>
                        <button className="py-2 px-4 border border-[#00b7ff] text-[#00b7ff] rounded-lg w-full mt-2 cursor-pointer hover:bg-[#00b7ff] hover:text-white transition-colors duration-300">
                            Liên hệ ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
