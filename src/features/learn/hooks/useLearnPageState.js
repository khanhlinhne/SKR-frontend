import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assignmentApi, courseApi } from '@/shared/api';
import { isSupportedLessonType, normalizeLessonType } from '@/shared/utils/lessonType';

function toNonNegativeCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
}

function resolveLessonTimeLimitMinutes(lesson = {}) {
    const parsed = Number(
        lesson?.timeLimitMinutes
        ?? lesson?.estimatedDurationMinutes
        ?? lesson?.durationMinutes
        ?? 0,
    );
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed);
}

function resolveLessonType(lesson = {}) {
    const explicitType = normalizeLessonType(lesson.lessonType ?? lesson.type);

    const totalFlashcardSets = toNonNegativeCount(lesson.totalFlashcardSets ?? lesson.flashcardSets?.length);
    const totalVideos = toNonNegativeCount(lesson.totalVideos ?? lesson.videos?.length);
    const totalDocuments = toNonNegativeCount(lesson.totalDocuments ?? lesson.documents?.length);
    const totalQuestions = toNonNegativeCount(lesson.totalQuestions ?? lesson.questions?.length);

    if (totalFlashcardSets > 0 && totalVideos === 0 && totalDocuments === 0 && totalQuestions === 0) return 'flashcard';
    if (lesson?.assignment?.assignmentId || lesson?.assignment?.title || lesson?.hasAssignment) return 'assignment';
    if (isSupportedLessonType(explicitType) && explicitType !== 'video') {
        return explicitType;
    }
    if (totalVideos > 0) return 'video';
    if (totalDocuments > 0) return 'document';
    if (totalQuestions > 0) return 'quiz';
    if (totalFlashcardSets > 0) return 'flashcard';
    if (explicitType === 'video') return 'video';

    return 'video';
}

function buildLessonKey(chapterId, lessonId) {
    if (!chapterId || !lessonId) return '';
    return `${chapterId}:${lessonId}`;
}

function hasLessonIdentifier(entry) {
    if (!entry || typeof entry !== 'object') return false;
    return Boolean(entry.lessonId || entry.lesson?.lessonId || entry.id || entry.lesson?.id);
}

function hasCompletionSignals(entry) {
    if (!entry || typeof entry !== 'object') return false;

    return (
        entry.completed != null
        || entry.isCompleted != null
        || entry.done != null
        || entry.completedAt != null
        || entry.completionDate != null
        || entry.progressPercent != null
        || entry.progress != null
        || entry.status != null
    );
}

function isCompletedProgressEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;

    if (entry.completed === true || entry.isCompleted === true || entry.done === true) {
        return true;
    }

    const status = String(entry.status || '').trim().toLowerCase();
    if (['completed', 'done', 'finished'].includes(status)) {
        return true;
    }

    if (entry.completedAt || entry.completionDate) {
        return true;
    }

    const progressPercent = Number(entry.progressPercent ?? entry.progress ?? NaN);
    if (Number.isFinite(progressPercent) && progressPercent >= 100) {
        return true;
    }

    return false;
}

function extractCompletedLessonIds(payload) {
    const ids = new Set();

    const addId = (value) => {
        if (value == null || value === '') return;
        ids.add(String(value));
    };

    const parseEntries = (entries, assumeCompleted = false) => {
        if (!Array.isArray(entries) || entries.length === 0) return;

        const shouldAssumeCompleted = assumeCompleted || entries.every((entry) => {
            if (entry == null) return true;
            if (typeof entry !== 'object') return true;
            return hasLessonIdentifier(entry) && !hasCompletionSignals(entry);
        });

        entries.forEach((entry) => {
            if (entry == null) return;

            if (typeof entry !== 'object') {
                if (shouldAssumeCompleted) {
                    addId(entry);
                }
                return;
            }

            const lessonId = entry.lessonId ?? entry.lesson?.lessonId ?? entry.id ?? entry.lesson?.id;
            if (lessonId && (shouldAssumeCompleted || isCompletedProgressEntry(entry))) {
                addId(lessonId);
            }

            parseObject(entry);
        });
    };

    const parseObject = (value) => {
        if (!value || typeof value !== 'object') return;

        if (Array.isArray(value.completedLessonIds)) parseEntries(value.completedLessonIds, true);
        if (Array.isArray(value.lessonIds)) parseEntries(value.lessonIds, true);
        if (Array.isArray(value.completedLessons)) parseEntries(value.completedLessons, true);
        if (Array.isArray(value.progress)) parseEntries(value.progress);
        if (Array.isArray(value.items)) parseEntries(value.items);
        if (Array.isArray(value.lessons)) parseEntries(value.lessons);
        if (Array.isArray(value.records)) parseEntries(value.records);
        if (Array.isArray(value.chapters)) {
            value.chapters.forEach((chapter) => parseObject(chapter));
        }
        if (value.data && value.data !== value) {
            if (Array.isArray(value.data)) {
                parseEntries(value.data);
            } else {
                parseObject(value.data);
            }
        }
    };

    if (Array.isArray(payload)) {
        parseEntries(payload);
    } else {
        parseObject(payload);
    }

    return [...ids];
}

function getLessonLoadingCopy(lesson = {}) {
    const lessonTitle = typeof lesson?.title === 'string' && lesson.title.trim()
        ? lesson.title.trim()
        : 'bài học này';

    switch (resolveLessonType(lesson)) {
        case 'flashcard':
            return {
                message: `Đang mở flashcard "${lessonTitle}"...`,
                subMessage: 'Cú đang xếp bộ thẻ, vị trí thẻ hiện tại và nhịp ôn tập để bạn tiếp tục không bị lệch mạch.',
            };
        case 'document':
            return {
                message: `Đang mở tài liệu "${lessonTitle}"...`,
                subMessage: 'Cú đang đồng bộ tài liệu, mô tả bài học và ghi chú liên quan trước khi hiển thị nội dung mới.',
            };
        case 'quiz':
            return {
                message: `Đang mở bài luyện tập "${lessonTitle}"...`,
                subMessage: 'Cú đang chuẩn bị câu hỏi, đáp án và tiến độ ôn tập để bạn chuyển bài mượt hơn.',
            };
        case 'assignment':
            return {
                message: `Dang mo assignment "${lessonTitle}"...`,
                subMessage: 'SKR dang dong bo de bai, rubric va bai nop gan nhat de ban tiep tuc lam bai.',
            };
        case 'video':
            return {
                message: `Đang mở bài giảng "${lessonTitle}"...`,
                subMessage: 'Cú đang đồng bộ video, tài liệu đính kèm và tiến độ hiện tại để mở đúng bài học bạn vừa chọn.',
            };
        default:
            return {
                message: `Đang mở "${lessonTitle}"...`,
                subMessage: 'Cú đang cập nhật nội dung bài học mới để giao diện và dữ liệu hiển thị đồng bộ.',
            };
    }
}

export default function useLearnPageState() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lessonContent, setLessonContent] = useState(null);
    const [lessonContentKey, setLessonContentKey] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeLesson, setActiveLesson] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewMode, setViewMode] = useState('learn');
    const [completedLessonIds, setCompletedLessonIds] = useState({});
    const [completionSaving, setCompletionSaving] = useState(false);
    const [quizView, setQuizView] = useState('detail');
    const [quizResult, setQuizResult] = useState(null);
    const [quizAttemptSeed, setQuizAttemptSeed] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await courseApi.getById(id);
                const data = response.data;
                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Không thể tải dữ liệu khóa học.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            void fetchCourse();
        }
    }, [id]);

    useEffect(() => {
        let ignore = false;

        const fetchProgress = async () => {
            if (!id) {
                setCompletedLessonIds({});
                return;
            }

            try {
                const response = await courseApi.getProgress(id);
                if (ignore) return;

                const completedIds = extractCompletedLessonIds(response?.data || response || {});
                setCompletedLessonIds(
                    Object.fromEntries(completedIds.map((lessonId) => [String(lessonId), true])),
                );
            } catch (progressError) {
                if (ignore) return;
                console.error('Error fetching course progress:', progressError);
                setCompletedLessonIds({});
            }
        };

        void fetchProgress();

        return () => {
            ignore = true;
        };
    }, [id]);

    const chapters = useMemo(() => {
        if (!course?.chapters) return [];
        return course.chapters
            .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
            .map((chapter) => ({
                chapterId: chapter.chapterId,
                title: chapter.chapterName,
                description: chapter.chapterDescription,
                estimatedDurationMinutes: chapter.estimatedDurationMinutes,
                lessons: (chapter.lessons || [])
                    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
                    .map((lesson) => {
                        const localAssignment = assignmentApi.peekLessonAssignment(id, chapter.chapterId, lesson.lessonId);
                        const hasAssignment = Boolean(lesson.hasAssignment)
                            || normalizeLessonType(lesson.lessonType || lesson.type) === 'assignment'
                            || Boolean(localAssignment?.assignmentId || localAssignment?.title);

                        return {
                            lessonId: lesson.lessonId,
                            title: lesson.lessonName,
                            description: lesson.lessonDescription,
                            lessonType: normalizeLessonType(lesson.lessonType ?? lesson.type),
                            type: resolveLessonType({
                                ...lesson,
                                hasAssignment,
                                assignment: localAssignment,
                            }),
                            durationMinutes: lesson.estimatedDurationMinutes || 0,
                            timeLimitMinutes: resolveLessonTimeLimitMinutes(lesson),
                            totalVideos: toNonNegativeCount(lesson.totalVideos),
                            totalDocuments: toNonNegativeCount(lesson.totalDocuments),
                            totalQuestions: toNonNegativeCount(lesson.totalQuestions),
                            totalFlashcardSets: toNonNegativeCount(lesson.totalFlashcardSets),
                            hasFlashcardSet: Boolean(lesson.hasFlashcardSet),
                            hasAssignment,
                            assignment: localAssignment || null,
                            isPreview: false,
                        };
                    }),
            }));
    }, [course, id]);

    const expert = useMemo(() => {
        if (!course?.creator) return null;
        return {
            name: course.creator.displayName || course.creator.fullName,
            avatar: course.creator.avatarUrl,
        };
    }, [course]);

    const courseDisplay = useMemo(() => {
        if (!course) return null;
        return {
            id: course.courseId,
            title: course.courseName,
            gradient: 'from-violet-500 to-purple-500',
            icon: '📚',
            totalChapters: course.totalChapters || chapters.length,
            totalLessons: course.totalLessons || 0,
        };
    }, [chapters.length, course]);

    const completedLessons = useMemo(() => {
        const next = {};

        chapters.forEach((chapter, chapterIndex) => {
            chapter.lessons.forEach((lesson, lessonIndex) => {
                if (completedLessonIds[String(lesson.lessonId)]) {
                    next[`${chapterIndex}-${lessonIndex}`] = true;
                }
            });
        });

        return next;
    }, [chapters, completedLessonIds]);

    const currentChapter = chapters[activeChapter];
    const currentLesson = currentChapter?.lessons[activeLesson];
    const currentLessonKey = buildLessonKey(currentChapter?.chapterId, currentLesson?.lessonId);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchLessonContent = async () => {
            if (!currentLessonKey || !id) {
                setLessonContent(null);
                setLessonContentKey('');
                setLoadingContent(false);
                return;
            }

            try {
                setLoadingContent(true);
                setLessonContent(null);
                setLessonContentKey('');
                const response = await courseApi.getLessonContent(
                    id,
                    currentChapter.chapterId,
                    currentLesson.lessonId,
                    { signal: controller.signal },
                );
                if (ignore) return;
                const content = response?.data || response || {};
                const assignment = resolveLessonType({
                    ...currentLesson,
                    ...content,
                }) === 'assignment'
                    ? await assignmentApi.getLessonAssignment(id, currentChapter.chapterId, currentLesson.lessonId)
                    : null;
                setLessonContent({
                    ...content,
                    assignment,
                });
                setLessonContentKey(currentLessonKey);
            } catch (err) {
                if (ignore || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
                    return;
                }
                console.error('Error fetching lesson content:', err);
                const assignment = resolveLessonType(currentLesson) === 'assignment'
                    ? await assignmentApi.getLessonAssignment(id, currentChapter.chapterId, currentLesson.lessonId)
                    : null;
                setLessonContent(assignment ? { assignment, lessonType: 'assignment' } : null);
                setLessonContentKey(currentLessonKey);
            } finally {
                if (!ignore) {
                    setLoadingContent(false);
                }
            }
        };

        void fetchLessonContent();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, [currentChapter?.chapterId, currentLesson?.lessonId, currentLesson, currentLessonKey, id]);

    const syncedLessonContent = lessonContentKey === currentLessonKey ? lessonContent : null;

    const shouldShowLessonLoader = Boolean(currentLessonKey)
        && (loadingContent || lessonContentKey !== currentLessonKey);

    const enrichedLesson = useMemo(() => {
        if (!currentLesson) return null;
        const flashcardSets = syncedLessonContent?.flashcardSets || syncedLessonContent?.flashcards || [];
        const type = resolveLessonType({
            ...currentLesson,
            lessonType: syncedLessonContent?.lessonType ?? currentLesson.lessonType ?? currentLesson.type,
            totalVideos: syncedLessonContent?.videos?.length ?? currentLesson.totalVideos,
            totalDocuments: syncedLessonContent?.documents?.length ?? currentLesson.totalDocuments,
            totalQuestions: syncedLessonContent?.questions?.length ?? currentLesson.totalQuestions,
            totalFlashcardSets: flashcardSets.length || currentLesson.totalFlashcardSets,
            assignment: syncedLessonContent?.assignment || currentLesson.assignment,
        });

        return {
            ...currentLesson,
            lessonType: syncedLessonContent?.lessonType ?? currentLesson.lessonType ?? currentLesson.type,
            type,
            durationMinutes: resolveLessonTimeLimitMinutes({
                estimatedDurationMinutes: syncedLessonContent?.estimatedDurationMinutes,
                durationMinutes: currentLesson.durationMinutes,
            }),
            timeLimitMinutes: resolveLessonTimeLimitMinutes({
                ...currentLesson,
                ...syncedLessonContent,
            }),
            videos: syncedLessonContent?.videos || [],
            documents: syncedLessonContent?.documents || [],
            questions: syncedLessonContent?.questions || [],
            flashcardSets,
            assignment: syncedLessonContent?.assignment || currentLesson.assignment || null,
            description: syncedLessonContent?.lessonDescription || currentLesson.description,
        };
    }, [currentLesson, syncedLessonContent]);

    const isFlashcardLessonView = enrichedLesson?.type === 'flashcard';
    const isQuizLessonView = enrichedLesson?.type === 'quiz';
    const isAssignmentLessonView = enrichedLesson?.type === 'assignment';
    const isCurrentLessonCompleted = Boolean(currentLesson?.lessonId && completedLessonIds[String(currentLesson.lessonId)]);

    useEffect(() => {
        setQuizView('detail');
        setQuizResult(null);
        setQuizAttemptSeed(0);
    }, [currentLessonKey]);

    const nextLesson = useMemo(() => {
        if (!currentChapter) return null;
        if (activeLesson < currentChapter.lessons.length - 1) {
            return currentChapter.lessons[activeLesson + 1];
        }
        if (activeChapter < chapters.length - 1) {
            return chapters[activeChapter + 1]?.lessons[0];
        }
        return null;
    }, [activeChapter, activeLesson, chapters, currentChapter]);

    const totalLessons = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    const completedCount = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    const handleLessonSelect = useCallback((chapterIndex, lessonIndex) => {
        if (chapterIndex === activeChapter && lessonIndex === activeLesson) {
            return;
        }
        setActiveChapter(chapterIndex);
        setActiveLesson(lessonIndex);
        setIsPlaying(false);
    }, [activeChapter, activeLesson]);

    const handleTogglePlay = useCallback(() => {
        setIsPlaying((previous) => !previous);
    }, []);

    const persistLessonCompletion = useCallback(async (lessonId, completed = true, chapterId = null) => {
        if (!id || !lessonId) return false;

        const normalizedLessonId = String(lessonId);
        const previousCompleted = Boolean(completedLessonIds[normalizedLessonId]);

        if (previousCompleted === completed) {
            return true;
        }

        setCompletionSaving(true);
        setCompletedLessonIds((previous) => {
            if (completed) {
                return { ...previous, [normalizedLessonId]: true };
            }

            const next = { ...previous };
            delete next[normalizedLessonId];
            return next;
        });

        try {
            await courseApi.updateProgress(id, { lessonId, chapterId, completed });
            return true;
        } catch (progressUpdateError) {
            console.error('Error updating course progress:', progressUpdateError);
            setCompletedLessonIds((previous) => {
                if (previousCompleted) {
                    return { ...previous, [normalizedLessonId]: true };
                }

                const next = { ...previous };
                delete next[normalizedLessonId];
                return next;
            });
            return false;
        } finally {
            setCompletionSaving(false);
        }
    }, [completedLessonIds, id]);

    const handleToggleComplete = useCallback(() => {
        if (!currentLesson?.lessonId || isCurrentLessonCompleted) return;
        void persistLessonCompletion(currentLesson.lessonId, true, currentChapter?.chapterId);
    }, [currentChapter?.chapterId, currentLesson?.lessonId, isCurrentLessonCompleted, persistLessonCompletion]);

    const handleMarkComplete = useCallback(() => {
        if (!currentLesson?.lessonId || isCurrentLessonCompleted) return;
        void persistLessonCompletion(currentLesson.lessonId, true, currentChapter?.chapterId);
    }, [currentChapter?.chapterId, currentLesson?.lessonId, isCurrentLessonCompleted, persistLessonCompletion]);

    const handleQuizStart = useCallback(() => {
        if (!currentChapter?.chapterId || !currentLesson?.lessonId) return;
        const quizUrl = `/courses/${id}/learn/quiz/${currentChapter.chapterId}/${currentLesson.lessonId}?gradient=${encodeURIComponent(courseDisplay?.gradient || 'from-violet-500 to-purple-500')}`;
        window.open(quizUrl, '_blank');
    }, [courseDisplay?.gradient, currentChapter?.chapterId, currentLesson?.lessonId, id]);

    const handleQuizSubmit = useCallback((result) => {
        setQuizResult(result);
        setQuizView('results');
        if (!isCurrentLessonCompleted) {
            handleMarkComplete();
        }
    }, [handleMarkComplete, isCurrentLessonCompleted]);

    const handleQuizRetry = useCallback(() => {
        setQuizResult(null);
        setQuizAttemptSeed((previous) => previous + 1);
        setQuizView('taking');
    }, []);

    const handleQuizShowReview = useCallback(() => {
        if (quizResult) {
            setQuizView('review');
        }
    }, [quizResult]);

    const handleQuizBackToResults = useCallback(() => {
        if (quizResult) {
            setQuizView('results');
        }
    }, [quizResult]);

    const handleQuizBackToDetail = useCallback(() => {
        setQuizView('detail');
    }, []);

    const handleNext = useCallback(() => {
        if (activeLesson < (currentChapter?.lessons.length || 0) - 1) {
            setActiveLesson((previous) => previous + 1);
        } else if (activeChapter < chapters.length - 1) {
            setActiveChapter((previous) => previous + 1);
            setActiveLesson(0);
        }
        setIsPlaying(false);
    }, [activeChapter, activeLesson, chapters.length, currentChapter?.lessons.length]);

    const lessonLoadingCopy = useMemo(
        () => getLessonLoadingCopy(currentLesson),
        [currentLesson],
    );

    return {
        courseId: id,
        course,
        loading,
        error,
        chapters,
        expert,
        courseDisplay,
        currentChapter,
        currentLesson,
        enrichedLesson,
        loadingContent,
        shouldShowLessonLoader,
        lessonLoadingCopy,
        isPlaying,
        viewMode,
        setViewMode,
        completedLessons,
        completionSaving,
        quizView,
        quizResult,
        quizAttemptSeed,
        nextLesson,
        overallProgress,
        isFlashcardLessonView,
        isQuizLessonView,
        isAssignmentLessonView,
        isCurrentLessonCompleted,
        activeChapter,
        activeLesson,
        handleLessonSelect,
        handleTogglePlay,
        handleToggleComplete,
        handleMarkComplete,
        handleQuizStart,
        handleQuizSubmit,
        handleQuizRetry,
        handleQuizShowReview,
        handleQuizBackToResults,
        handleQuizBackToDetail,
        handleNext,
    };
}
