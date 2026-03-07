import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { includedFeatureIcon as IncludedFeatureIcon, pricingPlans } from '@/features/home/constants';

function formatPrice(value) {
    if (!value) {
        return '0đ';
    }

    return `${value.toLocaleString('vi-VN')}đ`;
}

export default function PricingSection() {
    const [billing, setBilling] = useState('monthly');

    const plans = useMemo(
        () =>
            pricingPlans.map((plan) => ({
                ...plan,
                displayPrice: billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
                period: plan.monthlyPrice === 0 ? 'trọn đời' : billing === 'yearly' ? '/ tháng khi thanh toán năm' : '/ tháng',
            })),
        [billing]
    );

    return (
        <section id="pricing" className="px-6 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                        Bảng giá gọn, rõ và dễ quyết định
                    </div>
                    <h2 className="apple-main-text mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                        Chọn mức độ
                        <br />
                        <span className="apple-highlight-text">phù hợp với nhịp học của bạn</span>
                    </h2>
                    <p className="apple-secondary-text mt-6 text-lg leading-8">
                        Bắt đầu miễn phí để làm quen với flashcards và quiz, hoặc nâng cấp Premium khi bạn cần AI, lộ trình ôn tập sâu hơn và theo dõi tiến độ chi tiết.
                    </p>

                    <div className="apple-panel-strong mt-10 inline-flex rounded-full border p-1.5 backdrop-blur-xl">
                        {[
                            { key: 'monthly', label: 'Hàng tháng' },
                            { key: 'yearly', label: 'Hàng năm' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setBilling(item.key)}
                                className={`apple-transition rounded-full px-5 py-2.5 text-sm font-medium ${
                                    billing === item.key
                                        ? 'apple-primary-button'
                                        : 'apple-secondary-text hover:text-[var(--apple-text)]'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="mt-14 grid gap-5 lg:grid-cols-2">
                    {plans.map((plan, index) => (
                        <motion.article
                            key={plan.name}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className={`apple-card-shadow-md apple-transition rounded-[32px] border p-8 ${
                                plan.emphasis ? 'apple-emphasis-card' : 'apple-panel-strong backdrop-blur-xl'
                            }`}
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="apple-secondary-text text-sm font-medium">{plan.caption}</p>
                                        <h3 className="apple-main-text mt-3 text-3xl font-semibold tracking-[-0.03em]">{plan.name}</h3>
                                        <p className="apple-secondary-text mt-3 max-w-xl text-base leading-7">{plan.description}</p>
                                    </div>
                                    {plan.emphasis ? (
                                        <motion.span
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            className="apple-emphasis-badge rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                        >
                                            Đề xuất
                                        </motion.span>
                                    ) : null}
                                </div>

                                <div className="mt-10">
                                    <div className="flex items-end gap-3">
                                        <div className="apple-main-text text-5xl font-semibold tracking-[-0.04em]">
                                            {formatPrice(plan.displayPrice)}
                                        </div>
                                        <div className="apple-secondary-text pb-1 text-sm">{plan.period}</div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {plan.features.map((feature) => (
                                        <motion.div
                                            key={feature}
                                            whileHover={{ x: 3 }}
                                            className="apple-panel apple-transition flex items-start gap-3 rounded-2xl border px-4 py-4"
                                        >
                                            <IncludedFeatureIcon className="apple-accent-text mt-0.5 h-4 w-4 flex-shrink-0" />
                                            <span className="apple-secondary-text text-sm leading-6">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <Link
                                        to="/signup"
                                        className={`apple-transition inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold hover:-translate-y-px ${
                                            plan.emphasis ? 'apple-primary-button' : 'apple-secondary-button'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
