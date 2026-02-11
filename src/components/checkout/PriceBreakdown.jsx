import * as motion from 'motion/react-client';

/**
 * PriceBreakdown — shows original price, discount, coupon discount, and final total
 * Maps to payment_transactions.amount logic
 */
export default function PriceBreakdown({ plan, coupon = null }) {
    const originalPrice = plan.price;
    const planDiscount = plan.discountPercent ? originalPrice * (plan.discountPercent / 100) : 0;
    const afterPlanDiscount = originalPrice - planDiscount;

    let couponDiscount = 0;
    if (coupon) {
        if (coupon.discount_type === 'percentage') {
            couponDiscount = afterPlanDiscount * (coupon.discount_value / 100);
            if (coupon.max_discount_amount) {
                couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount);
            }
        } else {
            couponDiscount = coupon.discount_value;
        }
    }

    const totalDiscount = planDiscount + couponDiscount;
    const finalPrice = Math.max(0, originalPrice - totalDiscount);

    const formatVND = (amount) => {
        if (amount === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + '₫';
    };

    const rows = [
        { label: 'Giá gốc', value: formatVND(originalPrice), type: 'normal' },
    ];

    if (planDiscount > 0) {
        rows.push({
            label: `Giảm giá gói (${plan.discountPercent}%)`,
            value: `- ${formatVND(planDiscount)}`,
            type: 'discount',
        });
    }

    if (couponDiscount > 0) {
        rows.push({
            label: `Mã giảm giá (${coupon.code})`,
            value: `- ${formatVND(couponDiscount)}`,
            type: 'discount',
        });
    }

    return (
        <div className="space-y-3">
            {rows.map((row, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between text-sm"
                >
                    <span className="text-base-content/60 font-medium">{row.label}</span>
                    <span className={`font-bold ${row.type === 'discount' ? 'text-emerald-600' : 'text-base-content'
                        }`}>
                        {row.value}
                    </span>
                </motion.div>
            ))}

            {/* Divider */}
            <div className="border-t border-base-200 my-2" />

            {/* Total */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between"
            >
                <span className="text-base font-black text-base-content">Tổng thanh toán</span>
                <div className="text-right">
                    <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                        {formatVND(finalPrice)}
                    </span>
                    {totalDiscount > 0 && (
                        <p className="text-xs text-emerald-600 font-bold">
                            Tiết kiệm {formatVND(totalDiscount)}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
