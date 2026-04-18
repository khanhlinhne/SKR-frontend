import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Clock, Loader2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { orderApi, subjectApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';
import { OwlLoader } from '@/shared/ui/common';
import { isTokenValid } from '@/shared/utils/tokenManager';
import {
    buildCourseLearnPath,
    buildLoginRedirectPath,
    getCourseOrderSummary,
    mapCourseToPublicModel,
} from '@/features/courses/utils/publicCourseModel';
import CheckoutAccountCard from '../components/CheckoutAccountCard';
import CheckoutHeader from '../components/CheckoutHeader';
import CheckoutSteps from '../components/CheckoutSteps';
import CheckoutSuccess from '../components/CheckoutSuccess';
import OrderSummary from '../components/OrderSummary';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const checkoutType = 'course'; // Force course for now
    const courseId = searchParams.get('id');
    const isAuthenticated = isTokenValid();
    const loginHref = buildLoginRedirectPath(`${location.pathname}${location.search}`);
    const appHomePath = isAuthenticated ? '/dashboard' : '/';

    const { profile, refreshProfile } = useCurrentUserProfile();
    const [isHydratingProfile, setIsHydratingProfile] = useState(isAuthenticated);
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transaction, setTransaction] = useState(null);
    const [courseOrder, setCourseOrder] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [checkoutError, setCheckoutError] = useState('');
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    // QR Code Data
    const [qrData, setQrData] = useState(null);

    useEffect(() => {
        if (isAuthenticated) return;
        navigate(loginHref, { replace: true });
    }, [isAuthenticated, loginHref, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;
        setIsHydratingProfile(true);
        refreshProfile().finally(() => setIsHydratingProfile(false));
    }, [isAuthenticated, refreshProfile]);

    useEffect(() => {
        if (currentStep >= 3) return;
        const timer = setInterval(() => setTimeLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [currentStep]);

    useEffect(() => {
        const loadCourse = async () => {
            if (!courseId) {
                setCheckoutError('Thiếu mã khóa học để tiếp tục checkout.');
                setLoadingCourse(false);
                return;
            }
            try {
                setLoadingCourse(true);
                setCheckoutError('');
                const response = await subjectApi.getById(courseId);
                const payload = response.data?.data || response.data || response;
                if (!payload || (payload.status && payload.status !== 'published')) {
                    throw new Error('Khóa học này hiện chưa mở công khai để thanh toán.');
                }
                const normalizedCourse = mapCourseToPublicModel(payload, 0);
                setCourseOrder({
                    ...getCourseOrderSummary(normalizedCourse),
                    courseId: normalizedCourse.id,
                    courseTitle: normalizedCourse.title,
                });
            } catch (error) {
                setCheckoutError(error.message || 'Không tải được thông tin khóa học.');
            } finally {
                setLoadingCourse(false);
            }
        };
        if (isAuthenticated) loadCourse();
    }, [courseId, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <main className="px-4 py-20">
                    <div className="mx-auto max-w-4xl">
                        <OwlLoader message="Đang chuyển đến đăng nhập..." />
                    </div>
                </main>
            </div>
        );
    }

    const pageTitle = currentStep === 1 ? 'Xác nhận khóa học' : currentStep === 2 ? 'Thanh toán qua mã QR' : 'Hoàn tất';
    const backLink = courseId ? `/courses/${courseId}` : appHomePath;
    const canProceed = currentStep === 1 ? Boolean(courseOrder) && !loadingCourse && !checkoutError : true;

    const generateOrder = async () => {
        setIsProcessing(true);
        setCheckoutError('');
        try {
            const res = await orderApi.create({ courseId });
            const data = res.data?.data || res.data;

            if (data.isFree) {
                // Free course, skip QR
                setTransaction({
                    id: data.order.id,
                    amount: 'Miễn phí',
                    status: 'completed',
                    paymentMethod: 'Free',
                    destinationPath: buildCourseLearnPath(courseId, true),
                    destinationLabel: 'Vào học ngay',
                });
                setCurrentStep(3);
                return;
            }

            setQrData(data);
            setCurrentStep(2);
        } catch (error) {
            setCheckoutError(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto-polling for payment status
    useEffect(() => {
        let pollInterval;

        if (currentStep === 2 && qrData && qrData.orderCode) {
            // Start polling every 5 seconds
            pollInterval = setInterval(async () => {
                try {
                    const res = await orderApi.verify(qrData.orderCode);
                    // Handle various response structures
                    const data = res.data || res;
                    if (data && data.isCompleted) {
                        clearInterval(pollInterval);
                        toast.success("Thanh toán thành công! Đang đưa bạn đến khóa học...");
                        setTimeout(() => {
                            navigate(buildCourseLearnPath(courseId, true));
                        }, 1500);
                    }
                } catch (error) {
                    console.log("Polling...");
                }
            }, 5000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [currentStep, qrData, courseId, navigate]);

    const confirmPayment = async () => {
        if (!qrData || !qrData.orderCode) return;
        
        try {
            setIsProcessing(true);
            const res = await orderApi.verify(qrData.orderCode);
            const data = res.data || res;
            
            if (data && data.isCompleted) {
                toast.success("Thanh toán thành công! Đang đưa bạn đến khóa học...");
                setTimeout(() => {
                    navigate(buildCourseLearnPath(courseId, true));
                }, 1000);
            } else {
                toast.error(data?.message || "Chưa nhận được thanh toán. Xin chờ thêm chút nhé.");
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi kiểm tra. Nếu bạn vừa thanh toán, hãy thử lại sau vài giây.";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="apple-home apple-transition min-h-screen">
            <CheckoutHeader profile={profile} isAuthenticated={isAuthenticated} homeHref={appHomePath} />

            <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {currentStep < 3 ? (
                        <>
                            <Link to={backLink} className="apple-transition inline-flex items-center gap-2 text-sm font-semibold hover:text-[var(--apple-text)]">
                                <ArrowLeft className="h-4 w-4" /> Quay lại
                            </Link>

                            <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="apple-panel apple-card-shadow rounded-[36px] border p-7">
                                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">Checkout</div>
                                    <h1 className="apple-main-text mt-5 text-4xl font-semibold">{pageTitle}</h1>
                                </div>
                                <div className="apple-panel apple-card-shadow rounded-[36px] border p-6">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-orange-700">
                                        <Clock className="h-4 w-4" /> Phiên thanh toán còn hiệu lực: {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </section>

                            <div className="mt-8">
                                <CheckoutSteps currentStep={currentStep} />
                            </div>

                            <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                                <div className="space-y-6">
                                    <CheckoutAccountCard profile={profile} isAuthenticated={isAuthenticated} isHydrating={isHydratingProfile} compact={currentStep === 2} />

                                    {loadingCourse && (
                                        <div className="apple-panel rounded-[32px] border p-8"><OwlLoader message="Đang tải khóa học..." /></div>
                                    )}

                                    {checkoutError && (
                                        <motion.div className="rounded-[28px] border border-red-300 bg-red-50 p-5 text-red-700">
                                            <p className="font-semibold">Lỗi</p>
                                            <p>{checkoutError}</p>
                                        </motion.div>
                                    )}

                                    {currentStep === 1 && courseOrder && !loadingCourse && (
                                        <OrderSummary plan={courseOrder} orderType="course" />
                                    )}

                                    {currentStep === 2 && qrData && (
                                        <div className="apple-panel rounded-[32px] border p-8 text-center bg-white shadow-sm">
                                            <h2 className="text-xl font-bold mb-6 text-gray-800">Quét mã QR để thanh toán</h2>

                                            <div className="flex justify-center mb-6">
                                                <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm inline-block">
                                                    <img src={qrData.qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 max-w-sm mx-auto space-y-3">
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-500 text-sm">Ngân hàng</span>
                                                    <span className="font-bold text-gray-800">MB Bank</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-500 text-sm">Chủ tài khoản</span>
                                                    <span className="font-bold text-gray-800">{qrData.accountName}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-500 text-sm">Mã thanh toán</span>
                                                    <span className="font-bold text-blue-600 text-lg">{qrData.accountNo}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-500 text-sm">Số tiền</span>
                                                    <span className="font-bold text-rose-600 text-xl">{formatCurrency(qrData.amount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="text-gray-500 text-sm">Nội dung chuyển khoản</span>
                                                    <span className="font-bold text-gray-800 bg-yellow-100 px-2 py-1 rounded">{qrData.addInfo}</span>
                                                </div>
                                            </div>

                                            <p className="mt-6 text-sm text-gray-500 italic">Lưu ý: Vui lòng nhập đúng số tiền và nội dung chuyển khoản để hệ thống duyệt tự động.</p>
                                        </div>
                                    )}
                                </div>

                                <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                                    <div className="apple-panel rounded-[28px] border p-5">
                                        <p className="text-lg font-semibold mb-4">
                                            {currentStep === 1 ? 'Chi tiết đơn hàng' : 'Hoàn tất giao dịch'}
                                        </p>

                                        {currentStep === 1 && courseOrder && (
                                            <div className="flex justify-between text-xl font-bold mt-2 pb-4 border-b">
                                                <span>Tổng thanh toán:</span>
                                                <span className="text-rose-600">{formatCurrency(courseOrder.price)}</span>
                                            </div>
                                        )}

                                        <div className="mt-5 space-y-3">
                                            {currentStep === 1 ? (
                                                <button onClick={generateOrder} disabled={!canProceed || isProcessing} className="apple-primary-button w-full h-12 flex justify-center items-center rounded-full font-semibold">
                                                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : 'Tạo mã thanh toán QR'}
                                                </button>
                                            ) : (
                                                <button onClick={confirmPayment} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full h-12 flex justify-center items-center rounded-full font-semibold transition-colors">
                                                    <CheckCircle2 className="mr-2" />
                                                    Tôi đã chuyển khoản thành công
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    ) : (
                        <div className="pt-6">
                            <CheckoutSuccess
                                transaction={transaction}
                                plan={courseOrder}
                                orderType="course"
                                destinationPath={transaction?.destinationPath}
                                destinationLabel={transaction?.destinationLabel}
                                secondaryPath={appHomePath}
                                secondaryLabel="Về dashboard"
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
}

function formatCurrency(amount) {
    if (!amount) return 'Miễn phí';
    return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}
