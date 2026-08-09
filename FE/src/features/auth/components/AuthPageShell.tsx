import type { ReactNode } from 'react';
import { bg_auth, img_auth, logo } from '@/assets/assets';

interface AuthPageShellProps {
    title: string;
    children: ReactNode;
}

export default function AuthPageShell({ title, children }: AuthPageShellProps) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-[10px]"
            style={{ backgroundImage: `url(${bg_auth})` }}
        >
            <div className="bg-white rounded-2xl shadow-lg flex overflow-hidden w-fit">
                <div className="w-[400px] md:w-[600px] h-[720px] hidden lg:flex flex-col items-center justify-center p-8 bg-[linear-gradient(to_bottom,#e2efff_0%,#fff_100%)]">
                    <img
                        src={img_auth}
                        alt="Phongtro247"
                        className="max-w-[400px] max-h-[300px] mb-4"
                    />
                    <h2 className="text-2xl font-[600] text-[#2e2a2a] mb-2 uppercase mt-4">
                        Hơn <span className="text-[#00b7ff]">50.000</span> Chủ Trọ
                    </h2>
                    <p className="text-[#2e2a2a] text-center text-[16px] font-[500]">
                        Tin tưởng và sử dụng dịch vụ của Phongtro247
                    </p>
                </div>
                <div className="w-[380px] md:w-[400px] h-fit md:h-[720px] px-8 py-12 md:p-8 flex flex-col justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-[60px] h-[60px]">
                            <img src={logo} alt="Phongtro247" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#2e2a2a] mb-6 text-center">
                            {title}
                        </h2>
                    </div>
                    {children}
                </div>
            </div>
            <div className="mt-4">
                <div className="text-[#fffc] text-xs flex items-center gap-x-4 py-[5px] px-[15px] bg-[#00000029] rounded-full">
                    <span className="hover:text-[#fff] cursor-pointer">Điều khoản</span>
                    <span className="inline-block w-[1px] h-3 bg-[#fffc]"></span>
                    <span className="hover:text-[#fff] cursor-pointer">Trợ giúp</span>
                </div>
            </div>
        </div>
    );
}
