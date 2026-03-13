import { motion } from 'motion/react';

export default function PriceBreakdown({ plan, coupon = null }) {
    const originalPrice = Number(plan.price) || 0;
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

    const rows = [{ label: 'Giá gốc', value: formatVnd(originalPrice), tone: 'normal' }];

    if (planDiscount > 0) {
        rows.push({
            label: `Ưu đãi khóa học (${plan.discountPercent}%)`,
            value: `- ${formatVnd(planDiscount)}`,
            tone: 'discount',
        });
    }

    if (couponDiscount > 0) {
        rows.push({
            label: `Mã giảm giá (${coupon.code})`,
            value: `- ${formatVnd(couponDiscount)}`,
            tone: 'discount',
        });
    }

    return (
        <div className="space-y-4">
            {rows.map((row, index) => (
                <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="flex items-center justify-between gap-4 text-sm"
                >
                    <span className="text-base-content/60">{row.label}</span>
                    <span className={`font-semibold ${row.tone === 'discount' ? 'text-emerald-600' : 'text-base-content'}`}>
                        {row.value}
                    </span>
                </motion.div>
            ))}

            <div className="border-t apple-border" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-end justify-between gap-4"
            >
                <div>
                    <p className="text-sm font-semibold text-base-content">Tổng thanh toán</p>
                    <p className="mt-1 text-xs text-base-content/50">
                        Quyền truy cập sẽ được kích hoạt trên tài khoản của bạn sau khi thanh toán.
                    </p>
                </div>
                <div className="text-right">
                    <p className="bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-3xl font-semibold text-transparent">
                        {formatVnd(finalPrice)}
                    </p>
                    {totalDiscount > 0 ? (
                        <p className="text-xs font-semibold text-emerald-600">Tiết kiệm {formatVnd(totalDiscount)}</p>
                    ) : null}
                </div>
            </motion.div>
        </div>
    );
}

function formatVnd(amount) {
    if (!amount) {
        return 'Miễn phí';
    }

    return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}
