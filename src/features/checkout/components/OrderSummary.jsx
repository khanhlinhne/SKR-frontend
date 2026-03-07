import { motion } from 'motion/react';
import {
    BookOpen,
    Clock,
    Sparkles,
    Star,
    Check,
    Crown,
    Zap,
} from 'lucide-react';

/**
 * OrderSummary — displays the selected plan/course details
 * Maps to subscription_plans or subjects depending on order type
 */
export default function OrderSummary({ plan, orderType = 'subscription' }) {
    const isSubscription = orderType === 'subscription';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
        >
            {/* Plan/Course card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-base-200 bg-base-100">
                {/* Top gradient */}
                <div className={`h-1.5 bg-gradient-to-r ${plan.gradient || 'from-violet-600 to-blue-600'}`} />

                <div className="p-5">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${plan.popular
                                ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 border border-amber-500/20'
                                : 'bg-violet-500/10 text-violet-700 border border-violet-500/20'
                            }`}>
                            {plan.popular ? (
                                <><Crown className="w-3 h-3" /> Phổ biến nhất</>
                            ) : (
                                <><Zap className="w-3 h-3" /> {isSubscription ? 'Gói đăng ký' : 'Khóa học'}</>
                            )}
                        </span>
                    </div>

                    {/* Name + description */}
                    <h3 className="text-xl font-black text-base-content mb-1">{plan.name}</h3>
                    <p className="text-sm text-base-content/50 font-medium mb-4">{plan.description}</p>

                    {/* Features */}
                    {plan.features && (
                        <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.05 }}
                                    className="flex items-start gap-2.5"
                                >
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-sm text-base-content/70 font-medium">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                    )}

                    {/* Course extra info */}
                    {!isSubscription && plan.stats && (
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-base-200">
                            {plan.stats.rating && (
                                <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                                    <Star className="w-3.5 h-3.5 fill-orange-400" /> {plan.stats.rating}
                                </span>
                            )}
                            {plan.stats.lessons && (
                                <span className="flex items-center gap-1 text-xs text-base-content/50">
                                    <BookOpen className="w-3.5 h-3.5" /> {plan.stats.lessons} bài học
                                </span>
                            )}
                            {plan.stats.duration && (
                                <span className="flex items-center gap-1 text-xs text-base-content/50">
                                    <Clock className="w-3.5 h-3.5" /> {plan.stats.duration}
                                </span>
                            )}
                            {plan.stats.flashcards && (
                                <span className="flex items-center gap-1 text-xs text-base-content/50">
                                    <Sparkles className="w-3.5 h-3.5" /> {plan.stats.flashcards} flashcard
                                </span>
                            )}
                        </div>
                    )}

                    {/* Duration for subscription */}
                    {isSubscription && plan.durationDays && (
                        <div className="mt-4 pt-4 border-t border-base-200 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-violet-500" />
                            <span className="text-sm font-semibold text-base-content/60">
                                Thời hạn: {plan.durationDays >= 365 ? `${Math.round(plan.durationDays / 365)} năm` : `${plan.durationDays} ngày`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
