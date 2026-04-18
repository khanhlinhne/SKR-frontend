import { useCallback, useEffect, useState } from 'react';
import courseApi from '@/shared/api/courseApi';
import { assignmentApi } from '@/shared/api';
import { normalizeLessonType } from '@/shared/utils/lessonType';
import {
    getLessonDurationMinutes,
    getLessonFlashcardSets,
    lessonTypeConfig,
} from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';
import useCurriculumMutations from '@/features/expert/hooks/useCurriculumMutations';

export default function useCurriculumDetailPage({ courseId, feedback, overlays }) {
    const { showToast, requestConfirmation } = feedback;
    const {
        showAddLesson,
        showEditChapter,
        showEditLesson,
        showAddVideo,
        showAddDocument,
        showAddQuestion,
        showEditQuestion,
        showAssignmentBuilder,
        showAddFlashcardCard,
        setShowAddChapter,
        setShowAddLesson,
        setShowEditChapter,
        setShowEditLesson,
        setShowAddVideo,
        setShowAddDocument,
        setShowAddQuestion,
        setShowEditQuestion,
        setShowAssignmentBuilder,
        setShowAddFlashcardCard,
        setPreviewVideo,
        setPreviewDocument,
        setPreviewQuestion,
    } = overlays;

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [lessonTypeOverrides, setLessonTypeOverrides] = useState({});
    const [quizTimeLimitDraft, setQuizTimeLimitDraft] = useState('');

    const getLessonById = useCallback((chapterId, lessonId) => (
        (chapters.find((chapter) => (chapter.chapterId || chapter.id) === chapterId)?.lessons || [])
            .find((lesson) => (lesson.lessonId || lesson.id) === lessonId)
        || null
    ), [chapters]);

    const getResolvedLessonType = useCallback((lesson, content = null) => {
        const lessonId = lesson?.lessonId || lesson?.id || null;
        const overrideType = lessonId ? normalizeLessonType(lessonTypeOverrides[lessonId]) : null;
        if (overrideType && lessonTypeConfig[overrideType]) {
            return overrideType;
        }

        if (getLessonFlashcardSets(content).length > 0) {
            return 'flashcard';
        }

        if (Number(lesson?.totalFlashcardSets || 0) > 0 || lesson?.hasFlashcardSet) {
            return 'flashcard';
        }

        if (content?.assignment?.assignmentId || content?.assignment?.title || lesson?.hasAssignment) {
            return 'assignment';
        }

        const explicitType = normalizeLessonType(lesson?.lessonType || lesson?.type);
        if (lessonTypeConfig[explicitType]) {
            return explicitType;
        }

        return 'video';
    }, [lessonTypeOverrides]);

    useEffect(() => {
        if (!selectedLesson) {
            setQuizTimeLimitDraft('');
            return;
        }

        const selectedLessonMeta = getLessonById(selectedLesson.chapterId, selectedLesson.lessonId);
        if (!selectedLessonMeta || getResolvedLessonType(selectedLessonMeta, lessonContent) !== 'quiz') {
            setQuizTimeLimitDraft('');
            return;
        }

        const durationMinutes = getLessonDurationMinutes({
            ...selectedLessonMeta,
            ...lessonContent,
        });
        setQuizTimeLimitDraft(durationMinutes > 0 ? String(durationMinutes) : '');
    }, [getLessonById, getResolvedLessonType, lessonContent, selectedLesson]);

    const hydrateAssignmentLessonState = useCallback((inputChapters = []) => {
        const detectedOverrides = {};

        const nextChapters = (Array.isArray(inputChapters) ? inputChapters : []).map((chapter) => {
            const chapterId = chapter?.chapterId || chapter?.id;

            return {
                ...chapter,
                lessons: (chapter?.lessons || []).map((lesson) => {
                    const lessonId = lesson?.lessonId || lesson?.id;
                    const explicitType = normalizeLessonType(lesson?.lessonType || lesson?.type);
                    const localAssignment = chapterId && lessonId
                        ? assignmentApi.peekLessonAssignment(courseId, chapterId, lessonId)
                        : null;
                    const hasAssignment = explicitType === 'assignment'
                        || Boolean(lesson?.hasAssignment)
                        || Boolean(localAssignment?.assignmentId || localAssignment?.title);

                    if (hasAssignment && lessonId) {
                        detectedOverrides[lessonId] = 'assignment';
                    }

                    return {
                        ...lesson,
                        hasAssignment,
                    };
                }),
            };
        });

        if (Object.keys(detectedOverrides).length > 0) {
            setLessonTypeOverrides((prev) => ({ ...prev, ...detectedOverrides }));
        }

        return nextChapters;
    }, [courseId]);

    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const courseRes = await courseApi.getById(courseId);
            const courseData = courseRes?.data || courseRes;
            setCourse(courseData);

            const chaptersFromCourse = courseData?.chapters || [];
            if (chaptersFromCourse.length > 0) {
                const hydratedChapters = hydrateAssignmentLessonState(chaptersFromCourse);
                setChapters(hydratedChapters);
                setExpandedChapters(new Set([hydratedChapters[0]?.chapterId || hydratedChapters[0]?.id]));
            } else {
                try {
                    const chapRes = await courseApi.getChapters(courseId);
                    const chapData = chapRes?.data || chapRes || [];
                    const chapArray = Array.isArray(chapData) ? chapData : chapData?.chapters || [];
                    const hydratedChapters = hydrateAssignmentLessonState(chapArray);
                    setChapters(hydratedChapters);
                    if (hydratedChapters.length > 0) {
                        setExpandedChapters(new Set([hydratedChapters[0]?.chapterId || hydratedChapters[0]?.id]));
                    }
                } catch {
                    setChapters([]);
                }
            }
        } catch (err) {
            console.error('[CurriculumDetail] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin khóa học.');
        } finally {
            setLoading(false);
        }
    }, [courseId, hydrateAssignmentLessonState]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const toggleChapter = useCallback((chapterId) => {
        setExpandedChapters((prev) => {
            const next = new Set(prev);
            next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
            return next;
        });
    }, []);

    const getChapterLessons = useCallback((chapterId) => {
        const chapter = chapters.find((item) => (item.chapterId || item.id) === chapterId);
        return chapter?.lessons || [];
    }, [chapters]);

    const getChapterName = useCallback((chapterId) => {
        const chapter = chapters.find((item) => (item.chapterId || item.id) === chapterId);
        return chapter?.chapterName || '';
    }, [chapters]);

    const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0);

    const {
        handleAddChapter,
        handleDeleteChapter,
        handleAddLesson,
        handleDeleteLesson,
        handleEditChapter,
        handleEditLesson,
        handleCreateLessonFlashcardSet,
        toggleLessonContent,
        handleAddVideo,
        handleDeleteVideo,
        handleAddDocument,
        handleDeleteDocument,
        handleAddQuestion,
        handleEditQuestion,
        handleSaveAssignment,
        handleSaveQuizTiming,
        handleDeleteQuestion,
        handleSaveFlashcardCard,
        handleDeleteFlashcardItem,
    } = useCurriculumMutations({
        courseId,
        chapters,
        showAddLesson,
        showEditChapter,
        showEditLesson,
        showAddVideo,
        showAddDocument,
        showAddQuestion,
        showEditQuestion,
        showAssignmentBuilder,
        showAddFlashcardCard,
        selectedLesson,
        lessonContent,
        quizTimeLimitDraft,
        showToast,
        requestConfirmation,
        fetchCourseData,
        getChapterLessons,
        getLessonById,
        getResolvedLessonType,
        setLoadingContent,
        setSaving,
        setChapters,
        setSelectedLesson,
        setLessonContent,
        setLessonTypeOverrides,
        setShowAddChapter,
        setShowAddLesson,
        setShowEditChapter,
        setShowEditLesson,
        setShowAddVideo,
        setShowAddDocument,
        setShowAddQuestion,
        setShowEditQuestion,
        setShowAssignmentBuilder,
        setShowAddFlashcardCard,
    });

    const chapterActions = {
        onToggleChapter: toggleChapter,
        onEditChapter: setShowEditChapter,
        onDeleteChapter: handleDeleteChapter,
        onOpenAddLesson: setShowAddLesson,
        onToggleLessonContent: toggleLessonContent,
        onEditLesson: setShowEditLesson,
        onDeleteLesson: handleDeleteLesson,
        onQuizTimeLimitDraftChange: setQuizTimeLimitDraft,
        onOpenAddVideo: setShowAddVideo,
        onPreviewVideo: setPreviewVideo,
        onDeleteVideo: handleDeleteVideo,
        onOpenAddDocument: setShowAddDocument,
        onPreviewDocument: setPreviewDocument,
        onDeleteDocument: handleDeleteDocument,
        onOpenAddQuestion: setShowAddQuestion,
        onOpenEditQuestion: setShowEditQuestion,
        onPreviewQuestion: setPreviewQuestion,
        onDeleteQuestion: handleDeleteQuestion,
        onOpenAssignmentBuilder: setShowAssignmentBuilder,
        onSaveQuizTiming: handleSaveQuizTiming,
        onCreateFlashcardSet: handleCreateLessonFlashcardSet,
        onOpenFlashcardCardModal: setShowAddFlashcardCard,
        onDeleteFlashcardItem: handleDeleteFlashcardItem,
    };

    const lessonState = {
        lessonContent,
        loadingContent,
        saving,
        quizTimeLimitDraft,
    };

    const isLessonSelected = useCallback((chapterId, lessonId) => (
        selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lessonId
    ), [selectedLesson]);

    const questionModalContextTitle = overlays.showAddQuestion
        ? [
            course?.courseName,
            chapters.find((chapter) => (chapter.chapterId || chapter.id) === overlays.showAddQuestion.chapterId)?.chapterName,
            getLessonById(overlays.showAddQuestion.chapterId, overlays.showAddQuestion.lessonId)?.lessonName,
        ].filter(Boolean).join(' / ')
        : '';

    return {
        course,
        chapters,
        loading,
        error,
        saving,
        expandedChapters,
        selectedLesson,
        lessonContent,
        loadingContent,
        quizTimeLimitDraft,
        totalLessons,
        chapterActions,
        lessonState,
        questionModalContextTitle,
        fetchCourseData,
        getChapterLessons,
        getChapterName,
        getLessonById,
        getResolvedLessonType,
        isLessonSelected,
        handleAddChapter,
        handleAddLesson,
        handleEditChapter,
        handleEditLesson,
        handleAddVideo,
        handleAddDocument,
        handleAddQuestion,
        handleEditQuestion,
        handleSaveAssignment,
        handleSaveFlashcardCard,
    };
}
