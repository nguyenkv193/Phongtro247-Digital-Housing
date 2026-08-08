import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from '@/lib/navigation/router-compat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175') || 'http://localhost:5174';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token không hợp lệ');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    const verifyEmail = async (token: string): Promise<void> => {
        try {
            const res = await fetch(`${API_BASE}/api/email-verification/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);

                if (data.user) {
                    const currentUser = localStorage.getItem('auth_user');
                    if (currentUser) {
                        const user = JSON.parse(currentUser);
                        if (user.id === data.user.id) {
                            localStorage.setItem('auth_user', JSON.stringify(data.user));
                            window.dispatchEvent(new Event('authChanged'));
                        }
                    }
                }

                setTimeout(() => {
                    navigate('/account-info/account-info');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Xác thực thất bại');
            }
        } catch (err) {
            console.error('Error verifying email:', err);
            setStatus('error');
            setMessage('Lỗi kết nối. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 mt-[72px]">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-6xl text-blue-600 mb-4 animate-spin"
                        />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Đang xác thực email...
                        </h2>
                        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="text-6xl text-green-600 mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Xác thực thành công!
                        </h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">
                            Đang chuyển hướng về trang tài khoản...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FontAwesomeIcon
                            icon={faCircleXmark}
                            className="text-6xl text-red-600 mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực thất bại</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => navigate('/account-info')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Về trang tài khoản
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
