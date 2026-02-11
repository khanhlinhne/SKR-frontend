import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as motion from 'motion/react-client';
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Lock,
    Clock,
} from 'lucide-react';

import NavBar from '../components/NavBar';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummary from '../components/checkout/OrderSummary';
import CouponInput from '../components/checkout/CouponInput';
import PriceBreakdown from '../components/checkout/PriceBreakdown';
import PaymentMethods from '../components/checkout/PaymentMethods';
import CheckoutSuccess from '../components/checkout/CheckoutSuccess';

// ─── Mock Plans (maps to subscription_plans table) ──────
const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Trải nghiệm cơ bản — phù hợp khám phá nền tảng',
        price: 0,
        durationDays: 0,
        gradient: 'from-slate-500 to-gray-500',
        features: ['Flashcard cơ bản', '5 bài học / tuần', 'Cộng đồng'],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        description: 'Gói học tập toàn diện — truy cập không giới hạn',
        price: 299000,
        originalPrice: 399000,
        discountPercent: 25,
        durationDays: 30,
        popular: true,
        gradient: 'from-violet-600 to-blue-600',
        features: [
            'Truy cập toàn bộ khóa học',
            'Flashcard AI không giới hạn',
            'Lộ trình học cá nhân hóa',
            'Không quảng cáo',
            'Hỗ trợ ưu tiên',
        ],
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        description: 'Trải nghiệm cao cấp nhất — 1-on-1 với chuyên gia',
        price: 699000,
        originalPrice: 999000,
        discountPercent: 30,
        durationDays: 30,
        gradient: 'from-amber-500 to-orange-500',
        features: [
            'Tất cả tính năng Pro',
            'Tư vấn 1-1 với chuyên gia',
            'Đề thi mô phỏng nâng cao',
            'Phân tích AI chuyên sâu',
            'Certificate sau khi hoàn thành',
            'Ưu tiên tính năng mới',
        ],
    },
};

// ─── Main Page Component ────────────────────────────────

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan') || 'pro';
    const plan = PLANS[planId] || PLANS.pro;

    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transaction, setTransaction] = useState(null);

    // Countdown timer for urgency
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    useEffect(() => {
        if (currentStep >= 3) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [currentStep]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Handle payment submission
    const handlePayment = async () => {
        if (!paymentMethod) return;
        setIsProcessing(true);

        // Mock payment processing
        await new Promise((r) => setTimeout(r, 2500));

        setTransaction({
            id: `TXN-SKR-${Date.now()}`,
            paymentMethod: paymentMethod === 'momo' ? 'Ví MoMo'
                : paymentMethod === 'vnpay' ? 'VNPay'
                    : paymentMethod === 'zalopay' ? 'ZaloPay'
                        : paymentMethod === 'bank_transfer' ? 'Chuyển khoản'
                            : 'Visa/Mastercard',
            amount: new Intl.NumberFormat('vi-VN').format(plan.price) + '₫',
            status: 'completed',
        });

        setIsProcessing(false);
        setCurrentStep(3);
    };

    // Step navigation
    const canProceed =
        currentStep === 1 ? true :
            currentStep === 2 ? !!paymentMethod :
                false;

    const handleNext = () => {
        if (currentStep === 2) {
            handlePayment();
        } else if (currentStep < 3) {
            setCurrentStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1 && currentStep < 3) {
            setCurrentStep((s) => s - 1);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content">
            <NavBar />

            <main className="pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back link */}
                    {currentStep < 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6"
                        >
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-sm font-bold text-base-content/50 hover:text-violet-600 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Quay lại
                            </Link>
                        </motion.div>
                    )}

                    {/* Page title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        {currentStep < 3 ? (
                            <>
                                <h1 className="text-3xl md:text-4xl font-black text-base-content tracking-tight mb-2">
                                    {currentStep === 1 ? 'Xác nhận đơn hàng' : 'Thanh toán'}
                                </h1>
                                <p className="text-base-content/50 font-medium">
                                    {currentStep === 1
                                        ? 'Kiểm tra thông tin gói đăng ký trước khi thanh toán'
                                        : 'Chọn phương thức thanh toán phù hợp'}
                                </p>
                            </>
                        ) : null}
                    </motion.div>

                    {/* Steps indicator */}
                    <CheckoutSteps currentStep={currentStep} />

                    {/* Urgency timer */}
                    {currentStep < 3 && timeLeft > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-2 mb-8"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-bold text-orange-600">
                                    Ưu đãi còn hiệu lực trong{' '}
                                    <span className="font-mono text-orange-700">{formatTime(timeLeft)}</span>
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 1 & 2 Content ── */}
                    {currentStep < 3 && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* Left: Main content */}
                            <div className="lg:col-span-3 space-y-6">
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <OrderSummary plan={plan} orderType="subscription" />
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <PaymentMethods
                                            selected={paymentMethod}
                                            onSelect={setPaymentMethod}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Right: Sidebar (Price breakdown + Coupon + Actions) */}
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="sticky top-28 space-y-5"
                                >
                                    {/* Price breakdown card */}
                                    <div className="p-5 rounded-2xl border-2 border-base-200 bg-base-100 shadow-sm">
                                        <h3 className="text-base font-black text-base-content mb-4 flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-violet-500" />
                                            Chi tiết thanh toán
                                        </h3>
                                        <PriceBreakdown plan={plan} coupon={appliedCoupon} />
                                    </div>

                                    {/* Coupon */}
                                    <div className="p-5 rounded-2xl border-2 border-base-200 bg-base-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-base-content mb-3">Mã giảm giá</h3>
                                        <CouponInput
                                            appliedCoupon={appliedCoupon}
                                            onApply={(coupon) => setAppliedCoupon(coupon)}
                                            onRemove={() => setAppliedCoupon(null)}
                                        />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="space-y-3">
                                        <motion.button
                                            whileHover={canProceed ? { scale: 1.02, y: -2 } : {}}
                                            whileTap={canProceed ? { scale: 0.98 } : {}}
                                            onClick={handleNext}
                                            disabled={!canProceed || isProcessing}
                                            className={`btn btn-lg w-full rounded-2xl font-bold shadow-xl border-none text-white ${canProceed
                                                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-violet-600/20'
                                                    : 'bg-base-300 cursor-not-allowed text-base-content/30'
                                                } transition-all duration-300`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : currentStep === 2 ? (
                                                <>
                                                    <Lock className="w-5 h-5" />
                                                    Thanh toán an toàn
                                                </>
                                            ) : (
                                                <>
                                                    Tiếp tục
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </motion.button>

                                        {currentStep > 1 && (
                                            <button
                                                onClick={handleBack}
                                                disabled={isProcessing}
                                                className="btn btn-ghost w-full rounded-2xl font-bold text-base-content/50"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Quay lại
                                            </button>
                                        )}
                                    </div>

                                    {/* Trust signals */}
                                    <div className="flex items-center justify-center gap-4 text-base-content/30">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">SSL 256-bit</span>
                                        <span className="w-1 h-1 rounded-full bg-base-300" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Hoàn tiền 7 ngày</span>
                                        <span className="w-1 h-1 rounded-full bg-base-300" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Bảo mật 100%</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Success ── */}
                    {currentStep === 3 && (
                        <CheckoutSuccess transaction={transaction} plan={plan} />
                    )}
                </div>
            </main>
        </div>
    );
}
