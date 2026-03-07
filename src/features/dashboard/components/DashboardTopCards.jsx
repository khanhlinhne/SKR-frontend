import { motion } from 'motion/react';
import { Clock, TrendingUp } from 'lucide-react';
import { SUBJECT_COLOR_STYLES } from '@/features/dashboard/constants';

const CHART_MAX_VALUE = 17;

export default function DashboardTopCards({ stats, studyData, upcomingReviews, variants }) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StudyTimeCard stats={stats} studyData={studyData} variants={variants} />
            <PerformanceCard stats={stats} variants={variants} />
            <UpcomingReviewsCard upcomingReviews={upcomingReviews} variants={variants} />
        </div>
    );
}

function StudyTimeCard({ stats, studyData, variants }) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/60">Thời gian học</h3>
                <button className="btn btn-circle btn-ghost btn-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                </button>
            </div>
            <div className="mb-4">
                <h2 className="mb-2 text-4xl font-black text-base-content">{stats.studyTime} giờ</h2>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />Học mới
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />Ôn tập
                    </span>
                </div>
            </div>
            <div className="relative flex h-32 items-end justify-between gap-1.5 px-1">
                {studyData.map((item, index) => {
                    const studyHeight = (item.study / CHART_MAX_VALUE) * 100;
                    const practiceHeight = (item.practice / CHART_MAX_VALUE) * 100;
                    const isHighlighted = index === 7;

                    return (
                        <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                            <div className="flex h-24 w-full flex-col justify-end gap-0.5">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${practiceHeight}%` }}
                                    transition={{ delay: 0.6 + index * 0.05, duration: 0.6 }}
                                    className={`w-full rounded-t ${isHighlighted ? 'bg-orange-500' : 'bg-orange-400/60'}`}
                                />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${studyHeight}%` }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                                    className={`w-full ${practiceHeight > 0 ? '' : 'rounded-t'} ${isHighlighted ? 'bg-blue-500' : 'bg-blue-400/60'}`}
                                />
                            </div>
                            <span className="text-[9px] font-bold text-base-content/50">{item.month}</span>
                        </div>
                    );
                })}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="absolute -top-2 left-[62%] rounded-lg bg-base-content px-2.5 py-1.5 text-xs font-bold text-base-100 shadow-lg"
                >
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-base-content" />
                    14 giờ
                </motion.div>
            </div>
        </motion.div>
    );
}

function PerformanceCard({ stats, variants }) {
    const circumference = 2 * Math.PI * 70;

    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/60">Hiệu suất</h3>
                <button className="btn btn-circle btn-ghost btn-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </button>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90 transform">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-base-300" />
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                            className="text-green-500"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference * (1 - stats.performance / 100) }}
                            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-base-content">{stats.performance}%</span>
                        <span className="text-xs text-base-content/60">Điểm TB</span>
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-4 flex items-center gap-1 text-sm font-bold text-green-600"
                >
                    <TrendingUp className="h-4 w-4" />
                    Tăng 12% so với tuần trước!
                </motion.p>
            </div>
        </motion.div>
    );
}

function UpcomingReviewsCard({ upcomingReviews, variants }) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="whitespace-nowrap text-base font-black text-base-content sm:text-lg">Lịch ôn tập hôm nay</h3>
                <div className="badge badge-primary badge-sm shrink-0 whitespace-nowrap">Spaced Rep.</div>
            </div>
            <div className="space-y-3">
                {upcomingReviews.map((review, index) => {
                    const style = SUBJECT_COLOR_STYLES[review.color] || SUBJECT_COLOR_STYLES.blue;
                    const ReviewIcon = review.icon;

                    return (
                        <motion.div
                            key={review.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="group flex cursor-pointer items-center justify-between rounded-xl bg-base-200 p-3 transition-colors hover:bg-base-300"
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.softBg}`}>
                                    <ReviewIcon className={`h-5 w-5 ${style.text}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm font-bold text-base-content">{review.title}</h4>
                                    <p className="flex items-center gap-2 text-xs text-base-content/60">
                                        <Clock className="h-3 w-3" />
                                        {review.time} • {review.flashcards} flashcards
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-sm rounded-lg border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:shadow-lg">
                                Ôn ngay
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
