import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { orderApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';
import { OwlDialog, useOwlDialog } from '@/shared/ui/common';
import {
    buildCourseLearnPath,
} from '@/features/courses/utils/publicCourseModel';
import CheckoutHeader from '../components/CheckoutHeader';
import CheckoutSuccess from '../components/CheckoutSuccess';
import {
    clearCheckoutSession,
    resolveCheckoutSessionByOrderCode,
} from '../utils/checkoutSession';

const VERIFY_MAX_ATTEMPTS = 5;
const VERIFY_INTERVAL_MS = 3000;

export default function CheckoutResult() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useCurrentUserProfile();
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const orderCode = searchParams.get('orderCode') || '';
    const isSuccessRoute = location.pathname.endsWith('/success');
    const fallbackMessage = location.state?.message || '';
    const session = useMemo(() => resolveCheckoutSessionByOrderCode(orderCode), [orderCode]);
    const courseId = session?.courseId || '';

    const [status, setStatus] = useState(isSuccessRoute ? 'pending' : 'failure');
    const [message, setMessage] = useState(
        isSuccessRoute
            ? 'Frontend đang đợi backend xác nhận đơn PayOS của bạn.'
            : fallbackMessage || 'Bạn có thể kiểm tra lại sau khi hoàn tất chuyển khoản.',
    );
    const [isChecking, setIsChecking] = useState(false);
    const announcedRef = useRef(false);

    const destinationPath = courseId ? buildCourseLearnPath(courseId, true) : '/my-courses';

    const verifyOrder = useCallback(async ({ poll = false } = {}) => {
        if (!orderCode) {
            setStatus('failure');
            setMessage('Không tìm thấy orderCode để xác minh thanh toán.');
            return;
        }

        setStatus('pending');
        setIsChecking(true);

        try {
            const attempts = poll ? VERIFY_MAX_ATTEMPTS : 1;
            let lastMessage = 'Backend chưa ghi nhận thanh toán từ PayOS.';

            for (let attempt = 0; attempt < attempts; attempt += 1) {
                const response = await orderApi.verify(orderCode);
                const payload = response?.data || response || {};

                if (payload.isCompleted) {
                    clearCheckoutSession();
                    setStatus('success');
                    setMessage(payload.message || 'Thanh toán thành công qua PayOS.');
                    return;
                }

                lastMessage = payload.message || lastMessage;

                if (!poll || attempt === attempts - 1) {
                    setStatus('failure');
                    setMessage(lastMessage);
                    return;
                }

                await wait(VERIFY_INTERVAL_MS);
            }
        } catch (error) {
            setStatus('failure');
            setMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Không thể kiểm tra trạng thái đơn hàng lúc này.',
            );
        } finally {
            setIsChecking(false);
        }
    }, [orderCode]);

    useEffect(() => {
        if (!isSuccessRoute || !orderCode) {
            return;
        }

        void verifyOrder({ poll: true });
    }, [isSuccessRoute, orderCode, verifyOrder]);

    useEffect(() => {
        if (announcedRef.current || status === 'pending') {
            return;
        }

        announcedRef.current = true;

        if (status === 'success') {
            openDialog({
                variant: 'success',
                title: 'Cú xác nhận giao dịch thành công',
                message,
                details: orderCode ? `Mã đơn: ${orderCode}` : '',
                confirmLabel: 'Vào học ngay',
                confirmTone: 'success',
                onConfirm: () => {
                    navigate(destinationPath, { replace: true });
                },
            });
            return;
        }

        openDialog({
            variant: 'warning',
            title: 'Cú chưa thấy tiền về',
            message,
            details: orderCode ? `Mã đơn: ${orderCode}` : '',
            confirmLabel: 'Kiểm tra lại',
            confirmTone: 'warning',
            onConfirm: async () => {
                announcedRef.current = false;
                await verifyOrder({ poll: false });
            },
        });
    }, [destinationPath, message, navigate, openDialog, orderCode, status, verifyOrder]);

    return (
        <div className="apple-home apple-transition min-h-screen">
            <CheckoutHeader profile={profile} isAuthenticated homeHref="/dashboard" />

            <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to={courseId ? `/checkout?type=course&id=${courseId}` : '/my-courses'}
                        className="apple-transition inline-flex items-center gap-2 text-sm font-semibold apple-secondary-text hover:text-[var(--apple-text)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại checkout
                    </Link>

                    <div className="mt-8">
                        {isChecking && status === 'pending' ? (
                            <div className="apple-panel apple-card-shadow mx-auto max-w-3xl rounded-[36px] border p-10 text-center">
                                <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-600" />
                                <h1 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.04em]">
                                    Đang kiểm tra thanh toán
                                </h1>
                                <p className="apple-secondary-text mt-3 text-base leading-7">
                                    Frontend đang poll `GET /api/orders/:orderCode/verify` để xác nhận đơn hàng
                                    qua PayOS.
                                </p>
                            </div>
                        ) : (
                            <CheckoutSuccess
                                status={status}
                                description={message}
                                plan={{ name: session?.courseTitle || 'Khóa học SKR' }}
                                transaction={{
                                    orderCode,
                                    amount: formatCurrency(session?.amount),
                                    paymentMethod: 'Chuyển khoản PayOS',
                                    message,
                                }}
                                orderType="course"
                                destinationPath={destinationPath}
                                destinationLabel="Vào học ngay"
                                secondaryPath="/my-courses"
                                secondaryLabel="Về khóa học của tôi"
                                onRetry={status !== 'success' ? () => {
                                    announcedRef.current = false;
                                    void verifyOrder({ poll: true });
                                } : undefined}
                            />
                        )}
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

function formatCurrency(amount) {
    const numericAmount = Number(amount) || 0;

    if (numericAmount <= 0) {
        return 'Miễn phí';
    }

    return `${new Intl.NumberFormat('vi-VN').format(Math.round(numericAmount))}đ`;
}

function wait(durationMs) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, durationMs);
    });
}
