import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
    CheckCircle2,
    CircleDashed,
    Clock,
    Eye,
    RotateCcw,
    Sparkles,
    XCircle,
} from 'lucide-react';
import {
    formatTimeLeft,
    formatTimeLimitLabel,
    getQuizTimeLimitMinutes,
} from './learnQuizUtils';
import { getScoreTone } from './learnQuizTakingViewUtils';

export default function LearnQuizResultsView({ lesson, gradient, result, onRetry, onShowReview }) {
    const scoreTone = getScoreTone(result?.percentage || 0);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const percentage = result?.percentage ?? 0;
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (circumference * percentage) / 100;

    return (
        <div className="flex min-h-screen items-center justify-center bg-base-200 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl"
            >
                <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <div className="p-8">
                        <div className="mb-6 flex justify-center">
                            <div className="relative h-40 w-40">
                                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" className="stroke-base-300" />
                                    <motion.circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        className={scoreTone.stroke}
                                        style={{ strokeDasharray: circumference }}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: dashOffset }}
                                        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className={`text-3xl font-black leading-none ${scoreTone.text}`}
                                    >
                                        {percentage}%
                                    </motion.span>
                                    <span className="mt-1 text-[10px] font-black uppercase text-base-content/35">Điểm số</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${scoreTone.chip}`}>
                                <Sparkles className="h-3.5 w-3.5" />
                                {scoreTone.label}
                            </div>
                            <h2 className="text-xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                        </div>

                        <div className="mb-6 grid grid-cols-4 gap-3">
                            {[
                                { icon: CheckCircle2, label: 'Đúng', value: result.correctCount, cls: 'border-emerald-100 bg-emerald-50/60 text-emerald-700' },
                                { icon: XCircle, label: 'Sai', value: result.incorrectCount, cls: 'border-rose-100 bg-rose-50/60 text-rose-700' },
                                { icon: CircleDashed, label: 'Bỏ qua', value: result.skippedCount, cls: 'border-amber-100 bg-amber-50/60 text-amber-700' },
                                {
                                    icon: Clock,
                                    label: 'Thời gian',
                                    value: result.timeSpentSeconds != null ? formatTimeLeft(result.timeSpentSeconds) : formatTimeLimitLabel(timeLimitMinutes),
                                    cls: 'border-blue-100 bg-blue-50/60 text-blue-700',
                                },
                            ].map(({ icon: Icon, label, value, cls }) => (
                                <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
                                    <Icon className="mx-auto mb-1 h-4 w-4" />
                                    <p className="text-lg font-black">{value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}</p>
                                </div>
                            ))}
                        </div>

                        {result.submitReason === 'timeout' && (
                            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                <p className="font-black">⏱ Bài đã tự nộp do hết giờ.</p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onShowReview}
                                className={`btn rounded-xl border-none bg-gradient-to-r ${gradient} gap-1.5 font-bold text-white shadow-lg`}
                            >
                                <Eye className="h-4 w-4" />
                                Xem review
                            </motion.button>
                            <button
                                type="button"
                                onClick={onRetry}
                                className="btn rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Làm lại
                            </button>
                            <button
                                type="button"
                                onClick={() => window.close()}
                                className="btn rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                            >
                                Đóng tab
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
