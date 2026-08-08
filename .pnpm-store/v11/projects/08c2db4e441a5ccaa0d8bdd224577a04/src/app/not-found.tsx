import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <p className="text-sm font-semibold text-blue-700">404</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Không tìm thấy tin đăng</h1>
            <p className="mt-3 text-slate-500">Tin đăng có thể đã bị xoá hoặc không còn được xuất bản.</p>
            <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
                Về trang chủ
            </Link>
        </div>
    );
}



