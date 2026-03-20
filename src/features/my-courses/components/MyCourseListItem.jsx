import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Play,
    CheckCircle2,
    Clock,
    BookOpen,
    Star,
    ArrowRight,
    Trophy,
    RotateCcw,
    Layers,
} from 'lucide-react';

/**
 * MyCourseListItem — Premium list-view card khóa học đã mua.
 */
export default function MyCourseListItem({ enrollment, variants }) {
    const progressPercent = enrollment.progressPercent ?? 0;
    const isCompleted = progressPercent >= 100;
    const isNotStarted = progressPercent === 0;

    const statusConfig = isCompleted
        ? {
              gradient: 'from-emerald-500 to-teal-400',
              softBg: 'bg-emerald-500/8',
              text: 'text-emerald-600',
              barBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
              icon: Trophy,
              label: 'Hoàn thành',
              cta: 'Ôn tập',
              ctaIcon: RotateCcw,
          }
        : isNotStarted
            ? {
                  gradient: 'from-blue-500 to-indigo-500',
                  softBg: 'bg-blue-500/8',
                  text: 'text-blue-600',
                  barBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                  icon: Play,
                  label: 'Chưa bắt đầu',
                  cta: 'Bắt đầu',
                  ctaIcon: Play,
              }
            : {
                  gradient: 'from-violet-500 to-purple-500',
                  softBg: 'bg-violet-500/8',
                  text: 'text-violet-600',
                  barBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
                  icon: RotateCcw,
                  label: 'Đang học',
                  cta: 'Học tiếp',
                  ctaIcon: ArrowRight,
              };

    const StatusIcon = statusConfig.icon;
    const CtaIcon = statusConfig.ctaIcon;

    const handleImageError = (e) => {
        e.target.src =
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop';
    };

    return (
        <motion.div
            variants={variants}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}
            className="relative group"
        >
            {/* Glow */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
            />

            <div className="relative bg-base-100 rounded-2xl border border-base-300/60 hover:border-base-content/8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-row">
                {/* Thumbnail */}
                <div className="relative w-52 min-h-[130px] flex-shrink-0 overflow-hidden hidden sm:block">
                    <img
                        src={
                            enrollment.bannerUrl ||
                            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop'
                        }
                        alt={enrollment.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-base-100/40" />

                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-5 h-5 text-base-content ml-0.5" />
                        </div>
                    </div>

                    {/* Status stripe on left */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${statusConfig.gradient}`} />
                </div>

                {/* Content */}
                <div className="flex-1 p-4 py-3.5 flex flex-col justify-center min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            {/* Status badge */}
                            <div className="mb-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${statusConfig.softBg} ${statusConfig.text} text-[10px] font-semibold`}>
                                    <StatusIcon className="w-2.5 h-2.5" /> {statusConfig.label}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-base-content tracking-tight leading-snug mb-1.5 line-clamp-1">
                                {enrollment.title}
                            </h3>

                            {/* Meta info */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-base-content/50">
                                {enrollment.instructorName && (
                                    <span className="font-medium flex items-center gap-1">
                                        <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex-shrink-0 flex items-center justify-center">
                                            <span className="text-[6px] text-white font-bold">
                                                {enrollment.instructorName.charAt(0).toUpperCase()}
                                            </span>
                                        </span>
                                        {enrollment.instructorName}
                                    </span>
                                )}
                                <span className="w-0.5 h-0.5 rounded-full bg-base-content/20" />
                                <span className="flex items-center gap-0.5">
                                    <BookOpen className="w-3 h-3" />
                                    {enrollment.completedLessons || 0}/{enrollment.totalLessons || 0} bài
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {enrollment.estimatedDurationHours || 0}h
                                </span>
                                {enrollment.ratingAverage > 0 && (
                                    <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        {enrollment.ratingAverage.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {/* Progress bar (inline, below meta) */}
                            <div className="mt-2.5 max-w-xs">
                                <div className="h-1.5 bg-base-200/80 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                        className={`h-full rounded-full ${statusConfig.barBg} relative`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full" />
                                    </motion.div>
                                </div>
                                <span className={`text-[10px] font-semibold ${statusConfig.text} mt-0.5 block`}>
                                    {progressPercent}% hoàn thành
                                </span>
                            </div>
                        </div>

                        {/* Right: Circular progress + CTA */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Circular progress */}
                            <div className="hidden md:flex flex-col items-center gap-1">
                                <div className="relative w-14 h-14">
                                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                                        <circle
                                            cx="28"
                                            cy="28"
                                            r="23"
                                            fill="none"
                                            stroke="currentColor"
                                            className="text-base-200"
                                            strokeWidth="3.5"
                                        />
                                        <motion.circle
                                            cx="28"
                                            cy="28"
                                            r="23"
                                            fill="none"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            className={isCompleted ? 'text-emerald-500' : 'text-violet-500'}
                                            stroke="currentColor"
                                            strokeDasharray={`${2 * Math.PI * 23}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 23 }}
                                            animate={{
                                                strokeDashoffset:
                                                    2 * Math.PI * 23 * (1 - progressPercent / 100),
                                            }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-base-content">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link to={`/courses/${enrollment.courseId || enrollment.id}/learn`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-2.5 px-5 rounded-xl border-none font-semibold text-sm shadow-md hover:shadow-lg flex items-center gap-1.5 bg-gradient-to-r ${statusConfig.gradient} text-white transition-shadow`}
                                >
                                    {isCompleted ? (
                                        <>
                                            <CtaIcon className="w-3.5 h-3.5" />
                                            {statusConfig.cta}
                                        </>
                                    ) : isNotStarted ? (
                                        <>
                                            <CtaIcon className="w-3.5 h-3.5" />
                                            {statusConfig.cta}
                                        </>
                                    ) : (
                                        <>
                                            {statusConfig.cta}
                                            <CtaIcon className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
