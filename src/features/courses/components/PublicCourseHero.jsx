import { motion } from 'motion/react';
import { ArrowLeft, Clock3, PlayCircle, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicCourseHero({ course, previewAnchorId = 'preview-lessons' }) {
    return (
        <section className="px-6 pt-8 pb-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    to="/courses"
                    className="apple-transition inline-flex items-center gap-2 text-sm font-semibold apple-secondary-text hover:text-[var(--apple-text)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách khóa học
                </Link>

                <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9"
                    >
                        <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                            Public Course Detail
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] apple-secondary-text">
                            <span>{course.level}</span>
                            <span>{course.socialProof}</span>
                            {course.ratingAverage > 0 ? <span>{course.ratingAverage.toFixed(1)} / 5</span> : null}
                        </div>

                        <h1 className="apple-main-text mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                            {course.title}
                        </h1>
                        <p className="apple-secondary-text mt-5 max-w-3xl text-lg leading-8">
                            {course.subtitle}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <InfoChip icon={Users} label={course.socialProof} />
                            <InfoChip icon={Star} label={course.ratingAverage > 0 ? `${course.ratingAverage.toFixed(1)} sao` : 'Khóa học mới cập nhật'} />
                            <InfoChip icon={Clock3} label={`${course.estimatedDurationHours} giờ học`} />
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <div className="apple-soft-panel flex items-center gap-3 rounded-[24px] px-4 py-3">
                                {course.instructorAvatar ? (
                                    <img
                                        src={course.instructorAvatar}
                                        alt={course.instructorName}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="apple-solid-surface flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
                                        {course.instructorName.slice(0, 1)}
                                    </div>
                                )}
                                <div>
                                    <p className="apple-secondary-text text-xs font-medium uppercase tracking-[0.16em]">
                                        Giảng viên phụ trách
                                    </p>
                                    <p className="apple-main-text mt-1 text-sm font-semibold">{course.instructorName}</p>
                                </div>
                            </div>

                            <a
                                href={`#${previewAnchorId}`}
                                className="apple-secondary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
                            >
                                Xem bài học miễn phí
                            </a>

                            {course.previewVideoUrl ? (
                                <a
                                    href={course.previewVideoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
                                >
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Xem video giới thiệu
                                </a>
                            ) : null}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className={`apple-card-shadow relative overflow-hidden rounded-[36px] border bg-gradient-to-br ${course.accent.backgroundGradient}`}
                    >
                        <img
                            src={course.bannerUrl}
                            alt={`Ảnh bìa khóa học ${course.title}`}
                            className="h-full min-h-[320px] w-full object-cover"
                        />
                        <div className="apple-img-overlay absolute inset-0" />
                        <div className="apple-glass-overlay apple-glass-border absolute left-6 top-6 rounded-full border px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
                            {course.accent.badge}
                        </div>
                        <div className="apple-glass-overlay apple-glass-border absolute bottom-6 left-6 max-w-xs rounded-[28px] border px-5 py-4 text-white backdrop-blur-xl">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/72">Học phí</p>
                            <p className="mt-2 text-2xl font-semibold">{course.formattedPrice}</p>
                            <p className="mt-2 text-sm text-white/80">
                                {course.totalLessons} bài học, {course.totalQuestions} hoạt động ôn tập, {course.totalChapters} chương nội dung.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function InfoChip({ icon: Icon, label }) {
    return (
        <span className="apple-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            {label}
        </span>
    );
}
