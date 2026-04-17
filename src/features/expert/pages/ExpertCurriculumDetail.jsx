import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import { assignmentApi } from '@/shared/api';
import AddQuestionModal from '@/features/expert/components/AddQuestionModal';
import AssignmentBuilderModal from '@/features/expert/components/AssignmentBuilderModal';
import AddFlashcardCardModal from '@/features/expert/components/curriculum-detail/AddFlashcardCardModal';
import AddDocumentModal from '@/features/expert/components/curriculum-detail/AddDocumentModal';
import AddVideoModal from '@/features/expert/components/curriculum-detail/AddVideoModal';
import ChapterCard from '@/features/expert/components/curriculum-detail/ChapterCard';
import {
    AddChapterModal,
    AddLessonModal,
    EditChapterModal,
    EditLessonModal,
    EditQuestionModal,
} from '@/features/expert/components/curriculum-detail/CurriculumDetailModals';
import OwlConfirmDialog from '@/features/expert/components/curriculum-detail/OwlConfirmDialog';
import {
    CurriculumToast,
    DocumentPreviewModal,
    QuestionPreviewModal,
    VideoPreviewModal,
} from '@/features/expert/components/curriculum-detail/CurriculumDetailOverlays';
import {
    getLessonDurationMinutes,
    getLessonFlashcardSets,
    lessonTypeConfig,
} from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';
import useCurriculumMutations from '@/features/expert/hooks/useCurriculumMutations';
import { OwlLoader } from '@/shared/ui/common';
import {
    Plus,
    ChevronDown,
    ChevronRight,
    Eye,
    FolderPlus,
    Layers,
    BookOpen,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    GraduationCap,
    Hash,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ExpertCurriculumDetail() {
    const { courseId } = useParams();

    // Data states
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // UI states
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(null); // chapterId or null
    const [showEditChapter, setShowEditChapter] = useState(null);
    const [showEditLesson, setShowEditLesson] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Lesson content states
    const [selectedLesson, setSelectedLesson] = useState(null); // {chapterId, lessonId}
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(null); // {chapterId, lessonId}
    const [showAddDocument, setShowAddDocument] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(null);
    const [showEditQuestion, setShowEditQuestion] = useState(null);
    const [showAssignmentBuilder, setShowAssignmentBuilder] = useState(null);
    const [showAddFlashcardCard, setShowAddFlashcardCard] = useState(null);
    const [lessonTypeOverrides, setLessonTypeOverrides] = useState({});
    const [quizTimeLimitDraft, setQuizTimeLimitDraft] = useState('');

    // Preview states
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const toastTimeoutRef = useRef(null);
    const confirmResolverRef = useRef(null);

    // ===== TOAST HELPER =====
    const showToast = useCallback((payload, type = 'success') => {
        const toastPayload = typeof payload === 'string'
            ? { message: payload, type }
            : { ...payload, type: payload?.type || type };
        const resolvedType = toastPayload.type || type;
        const resolvedTitle = toastPayload.title || (
            resolvedType === 'error'
                ? 'CÃº chÆ°a xá»­ lÃ½ Ä‘Æ°á»£c thao tÃ¡c nÃ y'
                : 'CÃº Ä‘Ã£ cáº­p nháº­t giÃ¡o trÃ¬nh'
        );

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({
            ...toastPayload,
            type: resolvedType,
            title: resolvedTitle,
            message: toastPayload.message || '',
        });

        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4200);
    }, []);

    const dismissToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
        setToast(null);
    }, []);

    const requestConfirmation = useCallback((options) => (
        new Promise((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmDialog({
                tone: 'danger',
                cancelLabel: 'Giá»¯ láº¡i',
                confirmLabel: 'XÃ¡c nháº­n',
                hint: 'Thay Ä‘á»•i nÃ y sáº½ Ã¡p dá»¥ng ngay lÃªn giÃ¡o trÃ¬nh báº¡n Ä‘ang biÃªn soáº¡n.',
                ...options,
            });
        })
    ), []);

    const resolveConfirmation = useCallback((result) => {
        setConfirmDialog(null);
        if (confirmResolverRef.current) {
            confirmResolverRef.current(result);
            confirmResolverRef.current = null;
        }
    }, []);

    useEffect(() => () => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        if (confirmResolverRef.current) {
            confirmResolverRef.current(false);
            confirmResolverRef.current = null;
        }
    }, []);

    const getLessonById = useCallback((chapterId, lessonId) => (
        (chapters.find((chapter) => (chapter.chapterId || chapter.id) === chapterId)?.lessons || [])
            .find((lesson) => (lesson.lessonId || lesson.id) === lessonId)
        || null
    ), [chapters]);

    const getResolvedLessonType = useCallback((lesson, content = null) => {
        const lessonId = lesson?.lessonId || lesson?.id || null;
        const overrideType = lessonId ? lessonTypeOverrides[lessonId] : null;
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

        const explicitType = String(lesson?.lessonType || lesson?.type || '').trim().toLowerCase();
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
    }, [
        getLessonById,
        getResolvedLessonType,
        lessonContent,
        selectedLesson,
    ]);

    const hydrateAssignmentLessonState = useCallback((inputChapters = []) => {
        const detectedOverrides = {};

        const nextChapters = (Array.isArray(inputChapters) ? inputChapters : []).map((chapter) => {
            const chapterId = chapter?.chapterId || chapter?.id;

            return {
                ...chapter,
                lessons: (chapter?.lessons || []).map((lesson) => {
                    const lessonId = lesson?.lessonId || lesson?.id;
                    const explicitType = String(lesson?.lessonType || lesson?.type || '').trim().toLowerCase();
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

    // ===== FETCH DATA =====
    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const courseRes = await courseApi.getById(courseId);
            const courseData = courseRes?.data || courseRes;
            setCourse(courseData);

            // Course detail endpoint may return chapters nested
            const chaptersFromCourse = courseData?.chapters || [];
            if (chaptersFromCourse.length > 0) {
                const hydratedChapters = hydrateAssignmentLessonState(chaptersFromCourse);
                setChapters(hydratedChapters);
                // Auto-expand first chapter
                setExpandedChapters(new Set([hydratedChapters[0]?.chapterId || hydratedChapters[0]?.id]));
            } else {
                // Fallback: fetch chapters separately
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
            setError(err.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i thÃ´ng tin khÃ³a há»c.');
        } finally {
            setLoading(false);
        }
    }, [courseId, hydrateAssignmentLessonState]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    // ===== TOGGLE CHAPTER =====
    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
            return next;
        });
    };

    const getChapterLessons = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.lessons || [];
    };

    const getChapterName = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.chapterName || '';
    };

    const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

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
    const isLessonSelected = (chId, lsId) =>
        selectedLesson?.chapterId === chId && selectedLesson?.lessonId === lsId;

    // ===== LOADING STATE =====
    if (loading) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <OwlLoader
                        message="Äang táº£i chi tiáº¿t chÆ°Æ¡ng trÃ¬nh..."
                        subMessage="SKR Ä‘ang má»Ÿ chÆ°Æ¡ng, bÃ i há»c vÃ  tÃ i nguyÃªn hiá»‡n cÃ³ cá»§a khÃ³a há»c nÃ y."
                        className="py-8"
                    />
                </div>
            </ExpertLayout>
        );
    }

    // ===== ERROR STATE =====
    if (error) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-black">{error}</h3>
                        <div className="flex gap-2 justify-center">
                            <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                                <ArrowLeft className="w-4 h-4" />
                                {'Quay láº¡i'}
                            </Link>
                            <button onClick={fetchCourseData} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                <RefreshCw className="w-4 h-4" />
                                {'Thá»­ láº¡i'}
                            </button>
                        </div>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    const questionModalContextTitle = showAddQuestion
        ? [
            course?.courseName,
            chapters.find((chapter) => (chapter.chapterId || chapter.id) === showAddQuestion.chapterId)?.chapterName,
            getLessonById(showAddQuestion.chapterId, showAddQuestion.lessonId)?.lessonName,
        ].filter(Boolean).join(' / ')
        : '';

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link to="/expert/curriculum" className="text-sm text-base-content/50 font-medium hover:text-violet-600 transition-colors">
                                {'ChÆ°Æ¡ng trÃ¬nh há»c'}
                            </Link>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold truncate max-w-[300px]">
                                {course?.courseName || 'KhÃ³a há»c'}
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">
                            {chapters.length === 0 ? 'Táº¡o ChÆ°Æ¡ng trÃ¬nh há»c' : 'Quáº£n lÃ½ ChÆ°Æ¡ng trÃ¬nh há»c'}
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            {chapters.length === 0
                                ? 'Báº¯t Ä‘áº§u xÃ¢y dá»±ng ná»™i dung khÃ³a há»c báº±ng cÃ¡ch thÃªm cÃ¡c chÆ°Æ¡ng vÃ  bÃ i giáº£ng'
                                : 'Chá»‰nh sá»­a, thÃªm hoáº·c xÃ³a chÆ°Æ¡ng vÃ  bÃ i giáº£ng'
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <ArrowLeft className="w-4 h-4" />
                            {'Quay láº¡i'}
                        </Link>
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            {'Xem trÆ°á»›c'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'ChÆ°Æ¡ng', value: chapters.length, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'BÃ i giáº£ng', value: totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Tráº¡ng thÃ¡i', value: course?.status === 'published' ? 'ÄÃ£ xuáº¥t báº£n' : 'Báº£n nhÃ¡p', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'MÃ£ khÃ³a há»c', value: course?.courseCode || 'â€”', icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-3.5 border border-base-300 flex items-center gap-3 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Empty state for no chapters */}
                {chapters.length === 0 && (
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl border-2 border-dashed border-violet-500/30 p-12 text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-4">
                            <GraduationCap className="w-10 h-10 text-violet-500/50" />
                        </div>
                        <h3 className="text-lg font-black text-base-content mb-2">{'KhÃ³a há»c chÆ°a cÃ³ ná»™i dung'}</h3>
                        <p className="text-sm text-base-content/50 max-w-md mx-auto mb-5">
                            {'Báº¯t Ä‘áº§u xÃ¢y dá»±ng chÆ°Æ¡ng trÃ¬nh há»c báº±ng cÃ¡ch thÃªm chÆ°Æ¡ng Ä‘áº§u tiÃªn. Má»—i chÆ°Æ¡ng sáº½ chá»©a cÃ¡c bÃ i giáº£ng nhÆ° video, tÃ i liá»‡u hoáº·c flashcard.'}
                        </p>
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-black shadow-lg shadow-violet-500/25 gap-2"
                        >
                            <FolderPlus className="w-5 h-5" />
                            {'ThÃªm chÆ°Æ¡ng Ä‘áº§u tiÃªn'}
                        </button>
                    </motion.div>
                )}

                {/* Chapters List */}
                <div className="space-y-4">
                    {chapters.map((chapter, chapterIdx) => {
                        const chapterId = chapter.chapterId || chapter.id;

                        return (
                            <motion.div key={chapterId} variants={cardVariants}>
                                <ChapterCard
                                    chapter={chapter}
                                    chapterIndex={chapterIdx}
                                    isExpanded={expandedChapters.has(chapterId)}
                                    isLessonSelected={isLessonSelected}
                                    getResolvedLessonType={getResolvedLessonType}
                                    lessonState={lessonState}
                                    actions={chapterActions}
                                />
                            </motion.div>
                        );
                    })}
                </div>
                {/* Add Chapter Button */}
                {chapters.length > 0 && (
                    <motion.div variants={cardVariants} className="mt-4">
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn btn-lg w-full rounded-2xl font-black text-violet-600 bg-base-100 border-2 border-dashed border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/5 transition-all gap-2 shadow-lg"
                        >
                            <FolderPlus className="w-5 h-5" />
                            {'ThÃªm chÆ°Æ¡ng má»›i'}
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Modals */}
            <AddChapterModal
                open={showAddChapter}
                onClose={() => setShowAddChapter(false)}
                onSubmit={handleAddChapter}
                loading={saving}
            />
            <AddLessonModal
                open={!!showAddLesson}
                onClose={() => setShowAddLesson(null)}
                onSubmit={handleAddLesson}
                loading={saving}
                chapterName={showAddLesson ? getChapterName(showAddLesson) : ''}
                existingLessons={showAddLesson ? getChapterLessons(showAddLesson) : []}
                onValidationError={(validation) => {
                    if (!validation?.summary) return;
                    showToast({
                        title: 'CÃº cáº§n báº¡n kiá»ƒm tra láº¡i bÃ i giáº£ng má»›i',
                        message: validation.summary,
                    }, 'error');
                }}
            />
            {showEditChapter && (
                <EditChapterModal
                    open={true}
                    onClose={() => setShowEditChapter(null)}
                    onSubmit={handleEditChapter}
                    loading={saving}
                    initialValue={showEditChapter}
                    onValidationError={(validation) => {
                        if (!validation?.summary) return;
                        showToast({
                            title: 'Can kiem tra lai thong tin chuong',
                            message: validation.summary,
                        }, 'error');
                    }}
                />
            )}
            {showEditLesson && (
                <EditLessonModal
                    open={true}
                    onClose={() => setShowEditLesson(null)}
                    onSubmit={handleEditLesson}
                    loading={saving}
                    chapterName={getChapterName(showEditLesson.chapterId)}
                    existingLessons={getChapterLessons(showEditLesson.chapterId)}
                    currentLessonId={showEditLesson?.lesson?.lessonId || showEditLesson?.lesson?.id || null}
                    initialValue={showEditLesson?.lesson || null}
                    onValidationError={(validation) => {
                        if (!validation?.summary) return;
                        showToast({
                            title: 'Can kiem tra lai thong tin bai hoc',
                            message: validation.summary,
                        }, 'error');
                    }}
                />
            )}
            <AddFlashcardCardModal
                open={!!showAddFlashcardCard}
                onClose={() => setShowAddFlashcardCard(null)}
                onSubmit={handleSaveFlashcardCard}
                loading={saving}
                setTitle={showAddFlashcardCard?.setTitle || ''}
                nextOrder={showAddFlashcardCard?.nextOrder}
                mode={showAddFlashcardCard?.mode || 'create'}
                initialCards={showAddFlashcardCard?.initialCards || []}
            />

            <AddVideoModal
                open={!!showAddVideo}
                onClose={() => setShowAddVideo(null)}
                onSubmit={handleAddVideo}
                loading={saving}
            />
            <AddDocumentModal
                open={!!showAddDocument}
                onClose={() => setShowAddDocument(null)}
                onSubmit={handleAddDocument}
                loading={saving}
            />
            {/* Add Question Modal */}
            {showAddQuestion && (
                <AddQuestionModal
                    open={true}
                    onClose={() => setShowAddQuestion(null)}
                    onSubmit={handleAddQuestion}
                    loading={saving}
                    contextTitle={questionModalContextTitle}
                />
            )}

            {showEditQuestion && (
                <EditQuestionModal
                    open={true}
                    onClose={() => setShowEditQuestion(null)}
                    onSubmit={handleEditQuestion}
                    loading={saving}
                    initialValue={showEditQuestion.question}
                />
            )}

            {showAssignmentBuilder && (
                <AssignmentBuilderModal
                    open={true}
                    onClose={() => setShowAssignmentBuilder(null)}
                    onSave={handleSaveAssignment}
                    loading={saving}
                    contextTitle={showAssignmentBuilder.lessonName || 'Assignment lesson'}
                    initialValue={showAssignmentBuilder.initialValue}
                />
            )}
            <VideoPreviewModal previewVideo={previewVideo} onClose={() => setPreviewVideo(null)} />
            <DocumentPreviewModal previewDocument={previewDocument} onClose={() => setPreviewDocument(null)} />
            <QuestionPreviewModal previewQuestion={previewQuestion} onClose={() => setPreviewQuestion(null)} />

            <AnimatePresence>
                {confirmDialog && (
                    <OwlConfirmDialog
                        dialog={confirmDialog}
                        onCancel={() => resolveConfirmation(false)}
                        onConfirm={() => resolveConfirmation(true)}
                    />
                )}
            </AnimatePresence>

            <CurriculumToast
                toast={
                    toast
                        ? {
                            ...toast,
                            onClose: dismissToast,
                            cta: toast.type === 'error' ? 'C?n ki?m tra l?i' : 'Ðã c?p nh?t thành công',
                        }
                        : null
                }
            />
        </ExpertLayout>
    );
}


