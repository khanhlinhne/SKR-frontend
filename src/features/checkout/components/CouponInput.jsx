import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, Tag, X } from 'lucide-react';

export default function CouponInput({ onApply, onRemove, appliedCoupon = null }) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleApply = async () => {
        if (!code.trim()) {
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        await new Promise((resolve) => setTimeout(resolve, 900));

        const mockCoupons = {
            SKR20: { discount_type: 'percentage', discount_value: 20, description: 'Giảm 20% đơn hàng' },
            NEWUSER: { discount_type: 'percentage', discount_value: 30, description: 'Ưu đãi người dùng mới' },
            SAVE50K: { discount_type: 'fixed_amount', discount_value: 50000, description: 'Giảm 50.000đ' },
        };

        const coupon = mockCoupons[code.toUpperCase()];
        if (coupon) {
            setStatus('success');
            onApply?.({ code: code.toUpperCase(), ...coupon });
            return;
        }

        setStatus('error');
        setErrorMsg('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    };

    const handleRemove = () => {
        setCode('');
        setStatus('idle');
        setErrorMsg('');
        onRemove?.();
    };

    if (appliedCoupon) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between rounded-[22px] border border-emerald-500/20 bg-emerald-500/8 px-4 py-3"
            >
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">{appliedCoupon.code}</p>
                        <p className="text-xs text-emerald-700/80">{appliedCoupon.description}</p>
                    </div>
                </div>

                <button type="button" onClick={handleRemove} className="btn btn-ghost btn-xs btn-circle">
                    <X className="h-3.5 w-3.5" />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <label className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/30" />
                    <input
                        type="text"
                        value={code}
                        onChange={(event) => {
                            setCode(event.target.value.toUpperCase());
                            if (status === 'error') {
                                setStatus('idle');
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                void handleApply();
                            }
                        }}
                        placeholder="Nhập mã giảm giá"
                        className={`w-full rounded-[18px] border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none transition ${
                            status === 'error'
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-base-200 focus:border-sky-400'
                        }`}
                    />
                </label>

                <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleApply()}
                    disabled={!code.trim() || status === 'loading'}
                    className="apple-secondary-button apple-transition inline-flex h-[50px] min-w-[112px] items-center justify-center rounded-[18px] px-4 text-sm font-semibold disabled:opacity-50"
                >
                    {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                </motion.button>
            </div>

            {status === 'error' ? (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600"
                >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errorMsg}
                </motion.p>
            ) : null}
        </div>
    );
}
