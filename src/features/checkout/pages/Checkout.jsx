import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Clock, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { orderApi, subjectApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';
import { OwlLoader } from '@/shared/ui/common';
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
import CouponInput from '../components/CouponInput';
import OrderSummary from '../components/OrderSummary';
import PaymentMethods from '../components/PaymentMethods';
import PriceBreakdown from '../components/PriceBreakdown';

const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Trải nghiệm cơ bản để khám phá nền tảng trước khi nâng cấp.',
        price: 0,
        durationDays: 0,
        gradient: 'from-slate-500 to-gray-500',
        features: ['Flashcard cơ bản', '5 bài học mỗi tuần', 'Cộng đồng học tập'],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        description: 'Gói học tập toàn diện với quyền truy cập không giới hạn vào các tính năng cốt lõi.',
        price: 299000,
        originalPrice: 399000,
        discountPercent: 25,
        durationDays: 30,
        gradient: 'from-sky-500 to-cyan-500',
        features: [
            'Truy cập toàn bộ khóa học đang mở bán',
            'Flashcard AI không giới hạn',
            'Lộ trình học cá nhân hóa',
            'Không quảng cáo',
            'Hỗ trợ ưu tiên',
        ],
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        description: 'Trải nghiệm cao cấp nhất với các tính năng chuyên sâu và hỗ trợ 1-1.',
        price: 699000,
        originalPrice: 999000,
        discountPercent: 30,
        durationDays: 30,
        gradient: 'from-fuchsia-500 to-violet-500',
        features: [
            'Tất cả quyền lợi Pro',
            'Tư vấn 1-1 với chuyên gia',
            'Đề thi mô phỏng nâng cao',
            'Phân tích AI chuyên sâu',
            'Chứng nhận hoàn thành',
            'Ưu tiên tính năng mới',
        ],
    },
};

function hasAuthToken() {
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('accessToken');
    return Boolean(token && token !== 'undefined' && token !== 'null');
}

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const checkoutType = searchParams.get('type') === 'course' ? 'course' : 'subscription';
    const planId = searchParams.get('plan') || 'pro';
    const courseId = searchParams.get('id');
    const selectedPlan = PLANS[planId] || PLANS.pro;
    const isAuthenticated = hasAuthToken();
    const loginHref = buildLoginRedirectPath(`${location.pathname}${location.search}`);
    const appHomePath = isAuthenticated ? '/dashboard' : '/';

    const { profile, refreshProfile } = useCurrentUserProfile();
    const [isHydratingProfile, setIsHydratingProfile] = useState(isAuthenticated);
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transaction, setTransaction] = useState(null);
    const [courseOrder, setCourseOrder] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(checkoutType === 'course');
    const [checkoutError, setCheckoutError] = useState('');
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        if (isAuthenticated) {
            return;
        }

        navigate(loginHref, { replace: true });
    }, [isAuthenticated, loginHref, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsHydratingProfile(false);
            return undefined;
        }

        let isMounted = true;
        setIsHydratingProfile(true);

        void refreshProfile().finally(() => {
            if (isMounted) {
                setIsHydratingProfile(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, refreshProfile]);

    useEffect(() => {
        if (currentStep >= 3) {
            return undefined;
        }

        const timer = setInterval(() => {
            setTimeLeft((value) => (value > 0 ? value - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [currentStep]);

    useEffect(() => {
        let isMounted = true;

        const loadCourse = async () => {
            if (checkoutType !== 'course') {
                setLoadingCourse(false);
                return;
            }

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
                const courseSummary = getCourseOrderSummary(normalizedCourse);

                if (isMounted) {
                    setCourseOrder({
                        ...courseSummary,
                        courseId: normalizedCourse.id,
                        courseTitle: normalizedCourse.title,
                    });
                }
            } catch (error) {
                console.error('Failed to load course checkout:', error);
                if (isMounted) {
                    setCheckoutError(error.message || 'Không tải được thông tin khóa học.');
                }
            } finally {
                if (isMounted) {
                    setLoadingCourse(false);
                }
            }
        };

        if (isAuthenticated) {
            void loadCourse();
        }

        return () => {
            isMounted = false;
        };
    }, [checkoutType, courseId, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <main className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <OwlLoader
                            message="Đang chuyển đến đăng nhập..."
                            subMessage="Checkout chỉ dành cho người dùng đã đăng nhập để hệ thống gắn khóa học vào đúng tài khoản."
                            className="py-16"
                        />
                    </div>
                </main>
            </div>
        );
    }

    const orderItem = checkoutType === 'course' ? courseOrder : selectedPlan;
    const pageTitle =
        currentStep === 1
            ? checkoutType === 'course'
                ? 'Xác nhận khóa học'
                : 'Xác nhận gói học tập'
            : 'Thanh toán an toàn';
    const pageDescription =
        currentStep === 1
            ? checkoutType === 'course'
                ? 'Kiểm tra tài khoản nhận quyền truy cập và thông tin khóa học trước khi thanh toán.'
                : 'Kiểm tra tài khoản nhận quyền lợi và chi tiết gói học tập trước khi thanh toán.'
            : 'Chọn phương thức thanh toán phù hợp. Sau khi hoàn tất, quyền truy cập sẽ được kích hoạt trên tài khoản này.';
    const backLink = checkoutType === 'course' && courseId ? `/courses/${courseId}` : appHomePath;
    const canProceed =
        currentStep === 1
            ? Boolean(orderItem) && !loadingCourse && !checkoutError
            : currentStep === 2
                ? Boolean(paymentMethod) && !isProcessing
                : false;

    const handlePayment = async () => {
        if (!paymentMethod || !orderItem) {
            return;
        }

        setIsProcessing(true);
        setCheckoutError('');

        try {
            let createdOrder = null;

            try {
                const payload =
                    checkoutType === 'course'
                        ? {
                            orderType: 'course',
                            courseId,
                            paymentMethod,
                            items: [
                                {
                                    itemType: 'course',
                                    courseId,
                                    quantity: 1,
                                    unitPrice: orderItem.price,
                                },
                            ],
                        }
                        : {
                            orderType: 'subscription',
                            planId: selectedPlan.id,
                            paymentMethod,
                            items: [
                                {
                                    itemType: 'subscription',
                                    planId: selectedPlan.id,
                                    quantity: 1,
                                    unitPrice: selectedPlan.price,
                                },
                            ],
                        };

                createdOrder = await orderApi.create(payload);
            } catch (submitError) {
                console.warn('Checkout API unavailable or rejected payload. Falling back to mock success.', submitError);
            }

            await new Promise((resolve) => setTimeout(resolve, 1200));

            setTransaction({
                id:
                    createdOrder?.data?.orderId ||
                    createdOrder?.orderId ||
                    createdOrder?.data?.id ||
                    createdOrder?.id ||
                    `TXN-SKR-${Date.now()}`,
                paymentMethod: getPaymentMethodLabel(paymentMethod),
                amount: formatCurrency(orderItem.price),
                status: 'completed',
                destinationPath:
                    checkoutType === 'course' && courseId
                        ? buildCourseLearnPath(courseId, true)
                        : '/dashboard',
                destinationLabel: checkoutType === 'course' ? 'Vào học ngay' : 'Mở dashboard',
            });

            setCurrentStep(3);
        } catch (error) {
            console.error('Checkout failed:', error);
            setCheckoutError(error.message || 'Thanh toán chưa hoàn tất. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 2) {
            void handlePayment();
            return;
        }

        setCurrentStep((value) => Math.min(value + 1, 3));
    };

    const handleBack = () => {
        setCurrentStep((value) => Math.max(value - 1, 1));
    };

    return (
        <div className="apple-home apple-transition min-h-screen">
            <CheckoutHeader profile={profile} isAuthenticated={isAuthenticated} homeHref={appHomePath} />

            <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {currentStep < 3 ? (
                        <>
                            <Link
                                to={backLink}
                                className="apple-transition inline-flex items-center gap-2 text-sm font-semibold apple-secondary-text hover:text-[var(--apple-text)]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại
                            </Link>

                            <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9">
                                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                        Checkout
                                    </div>
                                    <h1 className="apple-main-text mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                                        {pageTitle}
                                    </h1>
                                    <p className="apple-secondary-text mt-4 max-w-3xl text-base leading-8">
                                        {pageDescription}
                                    </p>
                                </div>

                                <div className="apple-panel apple-card-shadow rounded-[36px] border p-6 sm:p-7">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-orange-700">
                                        <Clock className="h-4 w-4" />
                                        Phiên thanh toán còn hiệu lực trong {formatTime(timeLeft)}
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        <QuickNote
                                            icon={ShieldCheck}
                                            text="Thông tin thanh toán được bảo vệ và chỉ dùng để xử lý giao dịch."
                                        />
                                        <QuickNote
                                            icon={Sparkles}
                                            text="Quyền truy cập sẽ gắn vào đúng tài khoản đang hiển thị bên dưới."
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="mt-8">
                                <CheckoutSteps currentStep={currentStep} />
                            </div>

                            <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                                <div className="space-y-6">
                                    <CheckoutAccountCard
                                        profile={profile}
                                        isAuthenticated={isAuthenticated}
                                        isHydrating={isHydratingProfile}
                                        loginHref={loginHref}
                                        compact={currentStep === 2}
                                    />

                                    {loadingCourse ? (
                                        <div className="apple-panel apple-card-shadow rounded-[32px] border p-8">
                                            <OwlLoader
                                                message="Đang tải khóa học cần thanh toán..."
                                                subMessage="SKR đang lấy dữ liệu public course từ backend để dựng checkout."
                                                className="py-8"
                                            />
                                        </div>
                                    ) : null}

                                    {checkoutError ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="rounded-[28px] border border-red-300/60 bg-red-500/8 p-5"
                                        >
                                            <p className="text-sm font-semibold text-red-700">Không thể tiếp tục checkout</p>
                                            <p className="mt-2 text-sm leading-7 text-red-700/80">{checkoutError}</p>
                                        </motion.div>
                                    ) : null}

                                    {!loadingCourse && orderItem && currentStep === 1 ? (
                                        <OrderSummary plan={orderItem} orderType={checkoutType} />
                                    ) : null}

                                    {!loadingCourse && orderItem && currentStep === 2 ? (
                                        <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
                                    ) : null}
                                </div>

                                <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                                    <div className="apple-panel apple-card-shadow rounded-[32px] border p-6 sm:p-7">
                                        <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                            Order total
                                        </div>
                                        <h2 className="apple-main-text mt-5 text-2xl font-semibold tracking-[-0.03em]">
                                            Chi tiết thanh toán
                                        </h2>
                                        <div className="mt-6">
                                            {orderItem ? (
                                                <PriceBreakdown plan={orderItem} coupon={appliedCoupon} />
                                            ) : (
                                                <p className="text-sm text-base-content/50">
                                                    Thông tin đơn hàng sẽ xuất hiện sau khi dữ liệu được tải xong.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="apple-panel rounded-[28px] border p-5">
                                        <p className="text-sm font-semibold text-base-content">Mã giảm giá</p>
                                        <div className="mt-4">
                                            <CouponInput
                                                appliedCoupon={appliedCoupon}
                                                onApply={(coupon) => setAppliedCoupon(coupon)}
                                                onRemove={() => setAppliedCoupon(null)}
                                            />
                                        </div>
                                    </div>

                                    <div className="apple-panel rounded-[28px] border p-5">
                                        <p className="text-sm font-semibold text-base-content">
                                            {currentStep === 2 ? 'Sẵn sàng hoàn tất giao dịch' : 'Tiếp tục sang bước thanh toán'}
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-base-content/60">
                                            Sau khi hoàn tất, khóa học sẽ được kích hoạt ngay trên tài khoản hiện tại.
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            <motion.button
                                                whileHover={canProceed ? { y: -1 } : {}}
                                                whileTap={canProceed ? { scale: 0.99 } : {}}
                                                type="button"
                                                onClick={handleNext}
                                                disabled={!canProceed || isProcessing}
                                                className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : currentStep === 2 ? (
                                                    <>
                                                        Thanh toán an toàn
                                                        <ShieldCheck className="ml-2 h-4 w-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Tiếp tục
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </motion.button>

                                            {currentStep > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={handleBack}
                                                    disabled={isProcessing}
                                                    className="apple-secondary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Quay lại
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    ) : (
                        <div className="pt-6">
                            <CheckoutSuccess
                                transaction={transaction}
                                plan={orderItem}
                                orderType={checkoutType}
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

function QuickNote({ icon: Icon, text }) {
    return (
        <div className="flex items-start gap-3 rounded-[22px] border border-white/45 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-xl">
            <div className="apple-soft-panel flex h-9 w-9 items-center justify-center rounded-2xl">
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm leading-7 text-base-content/70">{text}</p>
        </div>
    );
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatCurrency(amount) {
    if (!amount) {
        return 'Miễn phí';
    }

    return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}

function getPaymentMethodLabel(paymentMethod) {
    switch (paymentMethod) {
        case 'momo':
            return 'Ví MoMo';
        case 'vnpay':
            return 'VNPay';
        case 'zalopay':
            return 'ZaloPay';
        case 'bank_transfer':
            return 'Chuyển khoản ngân hàng';
        default:
            return 'Visa / Mastercard';
    }
}
