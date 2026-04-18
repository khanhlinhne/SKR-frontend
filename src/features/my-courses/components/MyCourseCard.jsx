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
 * MyCourseCard — Premium card hiển thị khóa học đã mua trong trang My Courses.
 */
export default function MyCourseCard({ enrollment, variants }) {
    const progressPercent = enrollment.progressPercent ?? 0;
    const isCompleted = progressPercent >= 100;
    const isNotStarted = progressPercent === 0;

    // Premium color schemes
    const statusConfig = isCompleted
        ? {
              gradient: 'from-emerald-500 to-teal-400',
              softBg: 'bg-emerald-500/8',
              text: 'text-emerald-600',
              ring: 'ring-emerald-500/20',
              barBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
              icon: Trophy,
              label: 'Hoàn thành',
              cta: 'Ôn tập lại',
              ctaIcon: RotateCcw,
          }
        : isNotStarted
            ? {
                  gradient: 'from-blue-500 to-indigo-500',
                  softBg: 'bg-blue-500/8',
                  text: 'text-blue-600',
                  ring: 'ring-blue-500/20',
                  barBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                  icon: Play,
                  label: 'Chưa bắt đầu',
                  cta: 'Bắt đầu học',
                  ctaIcon: Play,
              }
            : {
                  gradient: 'from-violet-500 to-purple-500',
                  softBg: 'bg-violet-500/8',
                  text: 'text-violet-600',
                  ring: 'ring-violet-500/20',
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
            whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative group h-full"
        >
            {/* Glow Effect on hover */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.gradient} rounded-[20px] blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500`}
            />

            <div className="relative h-full bg-base-100 rounded-2xl border border-base-300/60 hover:border-base-content/8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-400 overflow-hidden flex flex-col">
                {/* Banner Image */}
                <div className="relative h-40 overflow-hidden">
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
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Top badges row */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                        {/* Status badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-sm text-[11px] font-semibold tracking-wide">
                            <StatusIcon className={`w-3 h-3 ${statusConfig.text}`} />
                            <span className={statusConfig.text}>{statusConfig.label}</span>
                        </span>

                        {/* Rating */}
                        {enrollment.ratingAverage > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {enrollment.ratingAverage.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="flex items-center gap-2 text-[10px] text-white/80 font-medium">
                            <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {enrollment.totalChapters || 0} chương
                            </span>
                            <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {enrollment.estimatedDurationHours || 0}h
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 pb-3 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-base-content leading-snug mb-1.5 line-clamp-2 tracking-tight group-hover:text-base-content transition-colors">
                        {enrollment.title}
                    </h3>

                    {/* Instructor */}
                    {enrollment.instructorName && (
                        <p className="text-xs text-base-content/50 font-medium mb-3 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex-shrink-0 flex items-center justify-center">
                                <span className="text-[7px] text-white font-bold">
                                    {enrollment.instructorName.charAt(0).toUpperCase()}
                                </span>
                            </span>
                            {enrollment.instructorName}
                        </p>
                    )}

                    {/* Lessons progress text */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-base-content/50">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {enrollment.completedLessons || 0}/{enrollment.totalLessons || 0} bài học
                        </span>
                        {isCompleted && (
                            <span className="flex items-center gap-0.5 text-emerald-500 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-base-content/40">
                                Tiến độ
                            </span>
                            <span className={`text-[11px] font-bold ${isCompleted ? 'text-emerald-500' : statusConfig.text}`}>
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-2 bg-base-200/80 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.25, 0.46, 0.45, 0.94],
                                    delay: 0.3,
                                }}
                                className={`h-full rounded-full ${statusConfig.barBg} relative`}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full" />
                            </motion.div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                        <Link to={`/courses/${enrollment.courseId || enrollment.id}/learn`}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r ${statusConfig.gradient} text-white shadow-md hover:shadow-lg active:shadow-sm`}
                            >
                                {isCompleted ? (
                                    <>
                                        <CtaIcon className="w-4 h-4" />
                                        {statusConfig.cta}
                                    </>
                                ) : isNotStarted ? (
                                    <>
                                        <CtaIcon className="w-4 h-4" />
                                        {statusConfig.cta}
                                    </>
                                ) : (
                                    <>
                                        {statusConfig.cta}
                                        <CtaIcon className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
