import * as motion from 'motion/react-client';
import {
    Star,
    Users,
    BookOpen,
    Clock,
    Play,
    FileText,
    Sparkles,
    CheckCircle2,
    Award,
    TrendingUp,
    GraduationCap,
    Globe
} from 'lucide-react';

/**
 * CourseDetailInfo - Main info section: title, description, stats, tags, expert card
 * Maps to: mst_subjects, mst_users
 *
 * @param {object} course  - Course data
 * @param {object} expert  - Expert data
 * @param {object} variants - Animation variants
 */
export default function CourseDetailInfo({ course, expert, variants }) {
    return (
        <div className="space-y-6">
            {/* Banner */}
            <motion.div
                variants={variants}
                className="relative rounded-2xl overflow-hidden h-48 md:h-64"
            >
                <img
                    src={course.bannerUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/30 to-transparent`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${course.bgGradient} opacity-40`} />

                {/* Category + Level */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${course.gradient} text-white text-xs font-bold shadow-lg`}>
                        {course.icon} {course.category}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-base-100/80 backdrop-blur-sm text-xs font-bold text-base-content shadow-lg">
                        {course.level}
                    </span>
                </div>

                {/* Discount badge */}
                {course.discountPercent > 0 && (
                    <div className="absolute top-4 right-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: -12 }}
                            transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-black rounded-xl shadow-lg"
                        >
                            -{course.discountPercent}%
                        </motion.div>
                    </div>
                )}
            </motion.div>

            {/* Title + Description */}
            <motion.div variants={variants}>
                <h1 className="text-2xl md:text-3xl font-black text-base-content tracking-tight mb-3">
                    {course.title}
                </h1>
                <p className="text-sm text-base-content/60 font-medium leading-relaxed">
                    {course.description}
                </p>
            </motion.div>

            {/* Tags */}
            <motion.div variants={variants} className="flex flex-wrap gap-2">
                {course.tags?.map((tag, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-base-200 text-xs font-bold text-base-content/60 hover:bg-base-300 transition-colors"
                    >
                        {tag}
                    </span>
                ))}
            </motion.div>

            {/* Stats grid */}
            <motion.div variants={variants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={Star} label="Đánh giá" value={`${course.ratingAverage} (${course.ratingCount})`} color="text-orange-500" bg="bg-orange-500/10" fillIcon />
                <StatBox icon={Users} label="Học viên" value={course.purchaseCount?.toLocaleString()} color="text-blue-500" bg="bg-blue-500/10" />
                <StatBox icon={Clock} label="Thời lượng" value={`${course.estimatedDurationHours} giờ`} color="text-emerald-500" bg="bg-emerald-500/10" />
                <StatBox icon={BookOpen} label="Bài học" value={`${course.totalLessons} bài`} color="text-violet-500" bg="bg-violet-500/10" />
            </motion.div>

            {/* Content overview cards */}
            <motion.div variants={variants}>
                <h3 className="text-base font-black text-base-content mb-3">Nội dung bao gồm</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ContentItem icon={BookOpen} label="Chương" value={course.totalChapters} color="text-blue-500" />
                    <ContentItem icon={Play} label="Video bài giảng" value={course.totalVideos} color="text-violet-500" />
                    <ContentItem icon={FileText} label="Tài liệu" value={course.totalDocuments} color="text-emerald-500" />
                    <ContentItem icon={Sparkles} label="Flashcard" value={course.flashcards} color="text-amber-500" />
                    <ContentItem icon={TrendingUp} label="Câu hỏi ôn tập" value={course.totalQuestions} color="text-rose-500" />
                    <ContentItem icon={Award} label="Chứng chỉ" value="Có" color="text-cyan-500" />
                </div>
            </motion.div>

            {/* Expert Card */}
            {expert && (
                <motion.div variants={variants}>
                    <h3 className="text-base font-black text-base-content mb-3">Giảng viên</h3>
                    <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <img
                                src={expert.avatar}
                                alt={expert.name}
                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-base-200 shadow-md"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-base font-black text-base-content">{expert.name}</h4>
                                    {expert.verified && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                                <p className="text-xs text-base-content/50 font-medium mb-3">{expert.title}</p>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/50">
                                    <span className="flex items-center gap-1 font-bold text-orange-500">
                                        <Star className="w-3 h-3 fill-orange-500" /> {expert.rating}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {expert.students?.toLocaleString()} học viên
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> {expert.courses} khóa học
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" /> {expert.speciality}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color, bg, fillIcon }) {
    return (
        <div className={`${bg} rounded-xl p-3 text-center`}>
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1 ${fillIcon ? `fill-current` : ''}`} />
            <p className="text-sm font-black text-base-content">{value}</p>
            <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{label}</p>
        </div>
    );
}

function ContentItem({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-base-100 border border-base-300">
            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
            <div className="min-w-0">
                <p className="text-sm font-black text-base-content">{value}</p>
                <p className="text-[10px] text-base-content/50 font-medium">{label}</p>
            </div>
        </div>
    );
}
