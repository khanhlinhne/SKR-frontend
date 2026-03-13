import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Eye, FileText, Lock, PlayCircle, Sparkles, CheckCircle2, Clock3 } from 'lucide-react';

const TYPE_META = {
    video: { icon: PlayCircle, label: 'Video', color: 'text-sky-600 bg-sky-500/12' },
    document: { icon: FileText, label: 'Tài liệu', color: 'text-emerald-600 bg-emerald-500/12' },
    flashcard: { icon: Sparkles, label: 'Flashcard', color: 'text-amber-600 bg-amber-500/12' },
    quiz: { icon: CheckCircle2, label: 'Quiz', color: 'text-violet-600 bg-violet-500/12' },
};

export default function PublicCourseCurriculumPreview({
    course,
    sectionId = 'preview-lessons',
}) {
    const [expandedChapterId, setExpandedChapterId] = useState(course.chapters[0]?.id ?? null);
    const previewLessons = useMemo(() => course.previewLessons || [], [course.previewLessons]);
    const [selectedPreviewLessonId, setSelectedPreviewLessonId] = useState(null);

    const selectedPreviewLesson = useMemo(
        () => previewLessons.find((lesson) => lesson.id === selectedPreviewLessonId) || previewLessons[0] || null,
        [previewLessons, selectedPreviewLessonId],
    );

    const totalDurationMinutes = course.chapters.reduce(
        (total, chapter) => total + chapter.lessons.reduce((lessonTotal, lesson) => lessonTotal + (lesson.durationMinutes || 0), 0),
        0,
    );

    return (
        <section id={sectionId} className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                        Curriculum Preview
                    </div>
                    <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                        Mở xem trước một vài bài miễn phí trước khi quyết định mua
                    </h2>
                    <p className="apple-secondary-text mt-4 max-w-3xl text-base leading-7">
                        SKR đang mở bài đầu tiên ở mỗi chương để người học cảm nhận cách nội dung được sắp xếp, độ sâu của bài giảng và nhịp ôn tập đi kèm.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    <span className="apple-chip rounded-full px-4 py-2">{course.totalChapters} chương</span>
                    <span className="apple-chip rounded-full px-4 py-2">{course.totalLessons} bài học</span>
                    <span className="apple-chip rounded-full px-4 py-2">{Math.max(Math.round(totalDurationMinutes / 60), course.estimatedDurationHours)} giờ nội dung</span>
                </div>
            </div>

            {selectedPreviewLesson ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 grid gap-5 rounded-[30px] border border-white/45 bg-white/75 p-6 shadow-sm backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]"
                >
                    <div>
                        <p className="apple-secondary-text text-xs font-semibold uppercase tracking-[0.16em]">
                            Bài xem trước đã chọn
                        </p>
                        <h3 className="apple-main-text mt-3 text-2xl font-semibold">{selectedPreviewLesson.title}</h3>
                        <p className="apple-secondary-text mt-4 text-sm leading-7">
                            {selectedPreviewLesson.description || 'Bài học này giúp bạn cảm nhận cấu trúc nội dung, nhịp trình bày và cách khóa học dẫn dắt người học vào chương.'}
                        </p>

                        {selectedPreviewLesson.learningObjectives ? (
                            <div className="mt-4 rounded-[24px] bg-base-100/75 px-4 py-4">
                                <p className="text-sm font-semibold text-base-content">Điểm chính bạn sẽ nắm được</p>
                                <p className="mt-2 text-sm leading-7 text-base-content/70">{selectedPreviewLesson.learningObjectives}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-[28px] bg-gradient-to-br from-base-100 to-base-200 p-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <Eye className="h-4 w-4" />
                            Miễn phí xem trước
                        </div>
                        <div className="mt-5 space-y-3 text-sm">
                            <PreviewMetaRow label="Loại nội dung" value={TYPE_META[selectedPreviewLesson.type]?.label || 'Bài học'} />
                            <PreviewMetaRow label="Thời lượng ước tính" value={`${selectedPreviewLesson.durationMinutes || 15} phút`} />
                            <PreviewMetaRow label="Mở khóa ngay sau khi mua" value={`${course.totalLessons - previewLessons.length} bài còn lại`} />
                        </div>

                        <div className="mt-6 rounded-[24px] border border-dashed border-base-300 px-4 py-4 text-sm text-base-content/65">
                            {course.previewVideoUrl
                                ? 'Khóa học có video giới thiệu riêng. Bạn có thể xem thêm ở phần đầu trang để nắm nhanh phong cách giảng dạy.'
                                : 'Phần preview hiện dùng mô tả và mục tiêu học tập của bài đầu mỗi chương, bám theo dữ liệu thật từ backend.'}
                        </div>
                    </div>
                </motion.div>
            ) : null}

            <div className="mt-8 space-y-3">
                {course.chapters.map((chapter, chapterIndex) => {
                    const isExpanded = expandedChapterId === chapter.id;
                    const chapterDuration = chapter.lessons.reduce((total, lesson) => total + (lesson.durationMinutes || 0), 0);

                    return (
                        <div
                            key={chapter.id}
                            className="overflow-hidden rounded-[28px] border border-white/45 bg-white/75 shadow-sm backdrop-blur-xl"
                        >
                            <button
                                type="button"
                                onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                                className="flex w-full items-center gap-4 px-5 py-4 text-left"
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${chapter.gradient} text-sm font-semibold text-white shadow-lg`}>
                                    {chapter.chapterNumber || chapterIndex + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="apple-main-text truncate text-lg font-semibold">{chapter.title}</h3>
                                    <p className="apple-secondary-text mt-1 text-sm">
                                        {chapter.lessons.length} bài học • {chapterDuration || chapter.durationMinutes || 0} phút
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`h-5 w-5 text-base-content/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: isExpanded ? 'auto' : 0,
                                    opacity: isExpanded ? 1 : 0,
                                }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-2 px-5 pb-5">
                                    {chapter.lessons.map((lesson) => (
                                        <LessonRow
                                            key={lesson.id}
                                            lesson={lesson}
                                            isSelected={selectedPreviewLesson?.id === lesson.id}
                                            onSelectPreview={() => setSelectedPreviewLessonId(lesson.id)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function LessonRow({ lesson, isSelected, onSelectPreview }) {
    const meta = TYPE_META[lesson.type] || TYPE_META.video;
    const Icon = meta.icon;
    const canPreview = lesson.isPreview;

    return (
        <div
            className={`flex flex-col gap-3 rounded-[22px] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                isSelected ? 'border-sky-400/45 bg-sky-500/8' : 'border-base-200 bg-base-100/70'
            }`}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-base-content">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/55">
                        <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {lesson.durationMinutes || 15} phút
                        </span>
                        <span>{meta.label}</span>
                    </div>
                </div>
            </div>

            {canPreview ? (
                <button
                    type="button"
                    onClick={onSelectPreview}
                    className="apple-primary-button apple-transition inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem trước
                </button>
            ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-base-200 px-4 py-2 text-xs font-semibold text-base-content/55">
                    <Lock className="h-3.5 w-3.5" />
                    Mua để mở khóa
                </div>
            )}
        </div>
    );
}

function PreviewMetaRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-base-200/80 pb-3 text-sm last:border-b-0 last:pb-0">
            <span className="text-base-content/55">{label}</span>
            <span className="text-right font-semibold text-base-content">{value}</span>
        </div>
    );
}
