import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Clock,
    Loader2,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { orderApi, subjectApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';
import { OwlDialog, OwlLoader, useOwlDialog } from '@/shared/ui/common';
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
import OrderSummary from '../components/OrderSummary';
import PaymentMethods from '../components/PaymentMethods';
import PriceBreakdown from '../components/PriceBreakdown';
import {
    readCheckoutSession,
    writeCheckoutSession,
} from '../utils/checkoutSession';

const PAYMENT_WINDOW_SECONDS = 15 * 60;

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = isTokenValid();
    const loginHref = buildLoginRedirectPath(`${location.pathname}${location.search}`);
    const appHomePath = isAuthenticated ? '/dashboard' : '/';
    const checkoutType = searchParams.get('type');
    const courseId = searchParams.get('id');
    const isCourseCheckout = checkoutType === 'course';

    const { profile, refreshProfile } = useCurrentUserProfile();
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const [isHydratingProfile, setIsHydratingProfile] = useState(isAuthenticated);
    const [currentStep, setCurrentStep] = useState(1);
    const [courseOrder, setCourseOrder] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [checkoutError, setCheckoutError] = useState('');
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [paymentSession, setPaymentSession] = useState(null);
    const [timeLeft, setTimeLeft] = useState(PAYMENT_WINDOW_SECONDS);

    const backLink = courseId ? `/courses/${courseId}` : appHomePath;

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
        if (!isCourseCheckout) {
            setCheckoutError('Trang checkout này hiện chỉ hỗ trợ mua khóa học qua PayOS.');
            setLoadingCourse(false);
            return;
        }

        if (!courseId) {
            setCheckoutError('Thiếu mã khóa học để tạo đơn thanh toán.');
            setLoadingCourse(false);
            return;
        }

        let isMounted = true;

        const restoreSession = () => {
            const savedSession = readCheckoutSession();

            if (!savedSession || savedSession.courseId !== courseId) {
                return;
            }

            setPaymentSession(savedSession);
            setCurrentStep(savedSession.orderCode ? 2 : 1);
        };

        const loadCourse = async () => {
            try {
                setLoadingCourse(true);
                setCheckoutError('');

                const response = await subjectApi.getById(courseId);
                const payload = response?.data || response;

                if (!payload || (payload.status && payload.status !== 'published')) {
                    throw new Error('Khóa học này hiện chưa sẵn sàng để thanh toán.');
                }

                const normalizedCourse = mapCourseToPublicModel(payload, 0);

                if (normalizedCourse.hasAccess) {
                    navigate(buildCourseLearnPath(normalizedCourse.id, true), { replace: true });
                    return;
                }

                if (isMounted) {
                    setCourseOrder({
                        ...getCourseOrderSummary(normalizedCourse),
                        courseId: normalizedCourse.id,
                        courseTitle: normalizedCourse.title,
                        isFree: normalizedCourse.isFree,
                    });
                    restoreSession();
                }
            } catch (error) {
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
    }, [courseId, isAuthenticated, isCourseCheckout, navigate]);

    useEffect(() => {
        const createdAt = paymentSession?.createdAt;

        if (!createdAt) {
            setTimeLeft(PAYMENT_WINDOW_SECONDS);
            return undefined;
        }

        const updateCountdown = () => {
            const elapsedSeconds = Math.max(
                0,
                Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000),
            );
            const nextValue = Math.max(PAYMENT_WINDOW_SECONDS - elapsedSeconds, 0);
            setTimeLeft(nextValue);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [paymentSession?.createdAt]);

    const canCreateOrder = Boolean(courseOrder) && !loadingCourse && !checkoutError && !isCreatingOrder;

    const summaryText = useMemo(() => {
        if (!paymentSession?.orderCode) {
            return 'Frontend sẽ tạo đơn thật từ backend rồi hiển thị đúng QR, nội dung chuyển khoản và link PayOS.';
        }

        return `Đơn ${paymentSession.orderCode} đang chờ bạn thanh toán và xác nhận lại với backend.`;
    }, [paymentSession?.orderCode]);

    if (!isAuthenticated) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <main className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <OwlLoader
                            message="Đang chuyển đến đăng nhập..."
                            subMessage="Checkout chỉ hoạt động cho tài khoản đã đăng nhập để backend gắn quyền học đúng người."
                            className="py-16"
                        />
                    </div>
                </main>
            </div>
        );
    }

    const handleCreateOrder = async () => {
        if (!courseOrder?.courseId || isCreatingOrder) {
            return;
        }

        setIsCreatingOrder(true);
        setCheckoutError('');

        try {
            const response = await orderApi.create({ courseId: courseOrder.courseId });
            const normalized = normalizeOrderCreationResponse(response);

            if (normalized.isFree) {
                openDialog({
                    variant: 'success',
                    title: 'Khóa học miễn phí đã được kích hoạt',
                    message: 'Backend trả về `isFree = true`, nên bạn có thể vào học ngay mà không cần qua PayOS.',
                    details: courseOrder.courseTitle || courseOrder.name,
                    confirmLabel: 'Vào học ngay',
                    confirmTone: 'success',
                    onConfirm: () => {
                        navigate(buildCourseLearnPath(courseOrder.courseId, true), { replace: true });
                    },
                });
                return;
            }

            if (!normalized.orderCode) {
                throw new Error('Backend chưa trả về orderCode cho đơn thanh toán.');
            }

            const nextSession = writeCheckoutSession({
                courseId: courseOrder.courseId,
                courseTitle: courseOrder.courseTitle || courseOrder.name,
                amount: normalized.amount ?? courseOrder.price,
                orderCode: normalized.orderCode,
                qrUrl: normalized.qrUrl || '',
                checkoutUrl: normalized.checkoutUrl || '',
                accountNo: normalized.accountNo || '',
                accountName: normalized.accountName || '',
                bankId: normalized.bankId || '',
                addInfo: normalized.addInfo || '',
                createdAt: new Date().toISOString(),
            });

            setPaymentSession(nextSession);
            setCurrentStep(2);
        } catch (error) {
            setCheckoutError(extractApiErrorMessage(error, 'Không thể tạo đơn thanh toán cho khóa học này.'));
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleOpenCheckout = () => {
        if (!paymentSession?.checkoutUrl) {
            openDialog({
                variant: 'warning',
                title: 'Đơn này chưa có link PayOS',
                message: 'Bạn vẫn có thể dùng QR hoặc thông tin chuyển khoản bên dưới để thanh toán.',
                confirmLabel: 'Đã hiểu',
                confirmTone: 'warning',
            });
            return;
        }

        window.open(paymentSession.checkoutUrl, '_blank', 'noopener,noreferrer');
    };

    const handleConfirmPaid = async () => {
        if (!paymentSession?.orderCode || isCheckingPayment) {
            return;
        }

        setIsCheckingPayment(true);

        try {
            const response = await orderApi.verify(paymentSession.orderCode);
            const payload = response?.data || response || {};

            if (payload.isCompleted) {
                navigate(`/checkout/success?orderCode=${encodeURIComponent(paymentSession.orderCode)}`);
                return;
            }

            navigate(`/checkout/cancel?orderCode=${encodeURIComponent(paymentSession.orderCode)}`, {
                state: {
                    message: payload.message || 'Backend chưa ghi nhận thanh toán từ PayOS.',
                },
            });
        } catch (error) {
            openDialog({
                variant: 'error',
                title: 'Chưa thể kiểm tra giao dịch',
                message: extractApiErrorMessage(error, 'Có lỗi khi gọi API verify của backend.'),
                confirmLabel: 'Đóng',
                confirmTone: 'danger',
            });
        } finally {
            setIsCheckingPayment(false);
        }
    };

    return (
        <div className="apple-home apple-transition min-h-screen">
            <CheckoutHeader profile={profile} isAuthenticated={isAuthenticated} homeHref={appHomePath} />

            <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
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
                                {currentStep === 1 ? 'Xác nhận khóa học' : 'Thanh toán bằng PayOS'}
                            </h1>
                            <p className="apple-secondary-text mt-4 max-w-3xl text-base leading-8">
                                {currentStep === 1
                                    ? 'Frontend sẽ tạo đơn từ `POST /api/orders` với `courseId`, sau đó lấy link thanh toán và QR từ backend để bạn hoàn tất giao dịch.'
                                    : 'Bạn đang dùng đúng phương thức mà backend hỗ trợ. Sau khi chuyển khoản xong, bấm xác nhận để frontend gọi API verify và báo kết quả.'}
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
                                    text="Thông tin thanh toán được bảo vệ và chỉ dùng để đối soát với PayOS."
                                />
                                <QuickNote
                                    icon={Sparkles}
                                    text={summaryText}
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
                                        subMessage="Mình đang lấy dữ liệu course để dựng đúng phần xác nhận và giá tiền."
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

                            {!loadingCourse && courseOrder && currentStep === 1 ? (
                                <OrderSummary plan={courseOrder} orderType="course" />
                            ) : null}

                            {!loadingCourse && courseOrder && currentStep === 2 ? (
                                <PaymentMethods
                                    paymentSession={paymentSession}
                                    onOpenCheckout={handleOpenCheckout}
                                />
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
                                    {courseOrder ? (
                                        <PriceBreakdown plan={{ ...courseOrder, price: paymentSession?.amount ?? courseOrder.price }} />
                                    ) : (
                                        <p className="text-sm text-base-content/50">
                                            Thông tin đơn hàng sẽ xuất hiện sau khi dữ liệu khóa học được tải xong.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {paymentSession?.orderCode ? (
                                <div className="apple-panel rounded-[28px] border p-5">
                                    <p className="text-sm font-semibold text-base-content">Đơn đang chờ xác nhận</p>
                                    <p className="mt-3 text-xl font-semibold text-base-content">{paymentSession.orderCode}</p>
                                    <p className="mt-2 text-sm leading-7 text-base-content/60">
                                        Sau khi hoàn tất chuyển khoản, bấm xác nhận để sang trang thông báo thành công hoặc thất bại.
                                    </p>
                                </div>
                            ) : null}

                            <div className="apple-panel rounded-[28px] border p-5">
                                <p className="text-sm font-semibold text-base-content">
                                    {currentStep === 1 ? 'Sẵn sàng tạo mã thanh toán' : 'Xác nhận sau khi đã chuyển khoản'}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-base-content/60">
                                    {currentStep === 1
                                        ? 'Bước này sẽ gọi đúng API backend và lấy dữ liệu PayOS thật cho khóa học hiện tại.'
                                        : 'Nút xác nhận sẽ gọi `GET /api/orders/:orderCode/verify` và điều hướng sang màn hình thông báo kết quả.'}
                                </p>

                                <div className="mt-5 space-y-3">
                                    {currentStep === 1 ? (
                                        <motion.button
                                            whileHover={canCreateOrder ? { y: -1 } : {}}
                                            whileTap={canCreateOrder ? { scale: 0.99 } : {}}
                                            type="button"
                                            onClick={handleCreateOrder}
                                            disabled={!canCreateOrder}
                                            className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50"
                                        >
                                            {isCreatingOrder ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Đang tạo đơn...
                                                </>
                                            ) : (
                                                'Tạo mã thanh toán'
                                            )}
                                        </motion.button>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={!isCheckingPayment ? { y: -1 } : {}}
                                                whileTap={!isCheckingPayment ? { scale: 0.99 } : {}}
                                                type="button"
                                                onClick={handleConfirmPaid}
                                                disabled={!paymentSession?.orderCode || isCheckingPayment}
                                                className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50"
                                            >
                                                {isCheckingPayment ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang kiểm tra thanh toán...
                                                    </>
                                                ) : (
                                                    'Xác nhận đã thanh toán'
                                                )}
                                            </motion.button>

                                            <button
                                                type="button"
                                                onClick={handleOpenCheckout}
                                                className="apple-secondary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                                            >
                                                Mở lại trang PayOS
                                            </button>
                                        </>
                                    )}

                                    {currentStep > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            disabled={isCreatingOrder || isCheckingPayment}
                                            className="apple-secondary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Quay lại thông tin khóa học
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onConfirm={handleDialogConfirm}
                onClose={closeDialog}
            />
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

function normalizeOrderCreationResponse(response) {
    const payload = response?.data || response || {};
    const innerData = payload?.data && typeof payload.data === 'object' ? payload.data : null;
    const freePayload = innerData?.order || payload?.order || null;
    const isFree = Boolean(innerData?.isFree ?? payload?.isFree);
    const paidPayload = innerData?.orderCode ? innerData : payload;

    return {
        isFree,
        freeOrder: freePayload,
        orderCode: paidPayload?.orderCode || '',
        amount: paidPayload?.amount ?? freePayload?.amount ?? 0,
        qrUrl: paidPayload?.qrUrl || '',
        checkoutUrl: paidPayload?.checkoutUrl || '',
        accountNo: paidPayload?.accountNo || '',
        accountName: paidPayload?.accountName || '',
        bankId: paidPayload?.bankId || '',
        addInfo: paidPayload?.addInfo || '',
    };
}

function extractApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage
    );
}
