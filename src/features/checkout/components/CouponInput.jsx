import { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

/**
 * CouponInput — maps to `coupons` table
 * Validates coupon code and returns discount info
 */
export default function CouponInput({ onApply, onRemove, appliedCoupon = null }) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleApply = async () => {
        if (!code.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        // Mock API call — replace with real API
        await new Promise((r) => setTimeout(r, 1200));

        const mockCoupons = {
            SKR20: { discount_type: 'percentage', discount_value: 20, description: 'Giảm 20% đơn hàng' },
            NEWUSER: { discount_type: 'percentage', discount_value: 30, description: 'Ưu đãi người dùng mới' },
            SAVE50K: { discount_type: 'fixed_amount', discount_value: 50000, description: 'Giảm 50,000₫' },
        };

        const coupon = mockCoupons[code.toUpperCase()];
        if (coupon) {
            setStatus('success');
            onApply?.({ code: code.toUpperCase(), ...coupon });
        } else {
            setStatus('error');
            setErrorMsg('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        }
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            >
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                        <span className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</span>
                        <span className="text-xs text-emerald-600/70 ml-2">{appliedCoupon.description}</span>
                    </div>
                </div>
                <button onClick={handleRemove} className="btn btn-ghost btn-xs btn-circle">
                    <X className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            if (status === 'error') setStatus('idle');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        placeholder="Nhập mã giảm giá"
                        className={`input input-bordered w-full pl-10 font-mono uppercase tracking-wider text-sm ${status === 'error' ? 'input-error' : ''
                            }`}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApply}
                    disabled={!code.trim() || status === 'loading'}
                    className="btn btn-outline border-violet-500 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 min-w-[100px]"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Áp dụng'
                    )}
                </motion.button>
            </div>

            {/* Error message */}
            {status === 'error' && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-error font-semibold"
                >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMsg}
                </motion.p>
            )}
        </div>
    );
}
