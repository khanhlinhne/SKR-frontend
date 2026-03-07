import { motion } from 'motion/react';
import { Clock, TrendingUp, CreditCard } from 'lucide-react';
import { SUBJECT_COLOR_STYLES } from '@/features/dashboard/constants';

export default function DashboardTopCards({ stats, studyData, upcomingReviews, variants }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StudyTimeCard stats={stats} studyData={studyData} variants={variants} />
            <PerformanceCard stats={stats} variants={variants} />
            <UpcomingReviewsCard upcomingReviews={upcomingReviews} variants={variants} />
        </div>
    );
}

function StudyTimeCard({ stats, studyData, variants }) {
    return (
        <motion.div variants={variants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider">Thoi Gian Hoc</h3>
                <button className="btn btn-circle btn-ghost btn-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                </button>
            </div>
            <div className="mb-4">
                <h2 className="text-4xl font-black text-base-content mb-2">{stats.studyTime} Gio</h2>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Hoc moi</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />On tap</span>
                </div>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-32 relative px-1">
                {studyData.map((item, index) => {
                    const maxValue = 17;
                    const studyHeight = (item.study / maxValue) * 100;
                    const practiceHeight = (item.practice / maxValue) * 100;
                    const isHighlighted = index === 7;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                            <div className="w-full flex flex-col gap-0.5 items-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${practiceHeight}%` }}
                                    transition={{ delay: 0.6 + index * 0.05, duration: 0.6 }}
                                    className={`w-full rounded-t ${isHighlighted ? 'bg-orange-500' : 'bg-orange-400/60'}`}
                                    style={{ minHeight: practiceHeight > 0 ? '3px' : '0' }}
                                />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${studyHeight}%` }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                                    className={`w-full ${practiceHeight > 0 ? '' : 'rounded-t'} ${isHighlighted ? 'bg-blue-500' : 'bg-blue-400/60'}`}
                                    style={{ minHeight: studyHeight > 0 ? '3px' : '0' }}
                                />
                            </div>
                            <span className="text-[9px] text-base-content/50 font-bold">{item.month}</span>
                        </div>
                    );
                })}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="absolute -top-2 left-[62%] bg-base-content text-base-100 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg"
                >
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45" />
                    14H
                </motion.div>
            </div>
        </motion.div>
    );
}

function PerformanceCard({ stats, variants }) {
    return (
        <motion.div variants={variants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider">Hieu Suat</h3>
                <button className="btn btn-circle btn-ghost btn-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                </button>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-base-300" />
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeLinecap="round"
                            className="text-green-500"
                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - stats.performance / 100) }}
                            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-base-content">{stats.performance}%</span>
                        <span className="text-xs text-base-content/60">Diem TB</span>
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-sm font-bold text-green-600 mt-4 flex items-center gap-1"
                >
                    <TrendingUp className="w-4 h-4" />
                    Tang 12% so voi tuan truoc!
                </motion.p>
            </div>
        </motion.div>
    );
}

function UpcomingReviewsCard({ upcomingReviews, variants }) {
    return (
        <motion.div variants={variants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-base sm:text-lg font-black text-base-content whitespace-nowrap">Lich On Tap Hom Nay</h3>
                <div className="badge badge-primary badge-sm whitespace-nowrap flex-shrink-0">Spaced Rep.</div>
            </div>
            <div className="space-y-3">
                {upcomingReviews.map((review, index) => {
                    const style = SUBJECT_COLOR_STYLES[review.color] || SUBJECT_COLOR_STYLES.blue;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-lg ${style.softBg} flex items-center justify-center`}>
                                    <CreditCard className={`w-5 h-5 ${style.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-base-content truncate">{review.title}</h4>
                                    <p className="text-xs text-base-content/60 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {review.time} • {review.flashcards} flashcards
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none hover:shadow-lg font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                On ngay
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
