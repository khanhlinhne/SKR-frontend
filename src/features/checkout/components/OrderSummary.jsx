import { motion } from 'motion/react';
import { BookOpen, Check, Clock, Sparkles, Star, UserRound, Zap } from 'lucide-react';

export default function OrderSummary({ plan, orderType = 'subscription' }) {
    const isSubscription = orderType === 'subscription';

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="apple-panel apple-card-shadow rounded-[32px] border p-6 sm:p-7"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                        {isSubscription ? 'Gói đăng ký' : 'Khóa học sắp sở hữu'}
                    </div>
                    <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                        {plan.name}
                    </h2>
                    <p className="apple-secondary-text mt-3 max-w-3xl text-sm leading-7">
                        {plan.description}
                    </p>
                </div>

                <div className={`rounded-full bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white ${plan.gradient || 'from-sky-500 to-cyan-500'}`}>
                    {isSubscription ? 'Subscription' : 'Course'}
                </div>
            </div>

            {!isSubscription && plan.instructorName ? (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-base-200 px-4 py-2 text-sm font-semibold text-base-content/70">
                    <UserRound className="h-4 w-4" />
                    {plan.instructorName}
                </div>
            ) : null}

            {plan.features?.length ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {plan.features.map((feature, index) => (
                        <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 + index * 0.04 }}
                            className="flex items-start gap-3 rounded-[22px] border border-white/45 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-xl"
                        >
                            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/12">
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <span className="text-sm leading-6 text-base-content/75">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            ) : null}

            {!isSubscription && plan.stats ? (
                <div className="mt-6 flex flex-wrap gap-3">
                    {plan.stats.rating ? (
                        <StatChip icon={Star} value={plan.stats.rating} />
                    ) : null}
                    {plan.stats.lessons ? (
                        <StatChip icon={BookOpen} value={`${plan.stats.lessons} bài học`} />
                    ) : null}
                    {plan.stats.duration ? (
                        <StatChip icon={Clock} value={plan.stats.duration} />
                    ) : null}
                    {plan.stats.flashcards ? (
                        <StatChip icon={Sparkles} value={`${plan.stats.flashcards} hoạt động`} />
                    ) : null}
                </div>
            ) : null}

            {isSubscription && plan.durationDays ? (
                <div className="mt-6 flex items-center gap-2 rounded-[22px] border border-white/45 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-xl">
                    <Zap className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-semibold text-base-content/75">
                        Thời hạn:{' '}
                        {plan.durationDays >= 365
                            ? `${Math.round(plan.durationDays / 365)} năm`
                            : `${plan.durationDays} ngày`}
                    </span>
                </div>
            ) : null}
        </motion.section>
    );
}

function StatChip({ icon: Icon, value }) {
    return (
        <div className="apple-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            {value}
        </div>
    );
}
