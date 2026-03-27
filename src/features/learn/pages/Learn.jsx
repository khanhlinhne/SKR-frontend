import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
    LearnSidebar,
    LearnVideoPlayer,
    LearnLessonContent,
    LearnHeader,
    LearnProgressView,
} from '@/features/learn/components';
import { courseApi } from '@/shared/api';

// ─── Learn Page ─────────────────────────────────────────

export default function Learn() {
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);

    // Active lesson state
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeLesson, setActiveLesson] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewMode, setViewMode] = useState('learn'); // 'learn' | 'progress'
    const [completedLessons, setCompletedLessons] = useState({});

    // Fetch course detail from API
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

        if (id) fetchCourse();
    }, [id]);

    // Map chapters from API data
    const chapters = useMemo(() => {
        if (!course?.chapters) return [];
        return course.chapters
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((ch) => ({
                chapterId: ch.chapterId,
                title: ch.chapterName,
                description: ch.chapterDescription,
                estimatedDurationMinutes: ch.estimatedDurationMinutes,
                lessons: (ch.lessons || [])
                    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                    .map((l) => ({
                        lessonId: l.lessonId,
                        title: l.lessonName,
                        description: l.lessonDescription,
                        type: 'video',
                        durationMinutes: l.estimatedDurationMinutes || 0,
                        isPreview: false,
                    })),
            }));
    }, [course]);

    // Expert info
    const expert = useMemo(() => {
        if (!course?.creator) return null;
        return {
            name: course.creator.displayName || course.creator.fullName,
            avatar: course.creator.avatarUrl,
        };
    }, [course]);

    // Course display info
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
    }, [course, chapters]);

    // Derived data
    const currentChapter = chapters[activeChapter];
    const currentLesson = currentChapter?.lessons[activeLesson];

    // Fetch lesson content when active lesson changes
    useEffect(() => {
        const fetchLessonContent = async () => {
            if (!currentChapter?.chapterId || !currentLesson?.lessonId || !id) {
                setLessonContent(null);
                return;
            }

            try {
                setLoadingContent(true);
                const response = await courseApi.getLessonContent(
                    id,
                    currentChapter.chapterId,
                    currentLesson.lessonId
                );
                setLessonContent(response.data);
            } catch (err) {
                console.error('Error fetching lesson content:', err);
                setLessonContent(null);
            } finally {
                setLoadingContent(false);
            }
        };

        fetchLessonContent();
    }, [id, currentChapter?.chapterId, currentLesson?.lessonId]);

    // Merge lesson content into current lesson for child components
    const enrichedLesson = useMemo(() => {
        if (!currentLesson) return null;
        return {
            ...currentLesson,
            videos: lessonContent?.videos || [],
            documents: lessonContent?.documents || [],
            questions: lessonContent?.questions || [],
            description: lessonContent?.lessonDescription || currentLesson.description,
        };
    }, [currentLesson, lessonContent]);

    // Find next lesson
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

    // Overall progress
    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const completedCount = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    // Handlers
    const handleLessonSelect = useCallback((chIdx, lIdx) => {
        setActiveChapter(chIdx);
        setActiveLesson(lIdx);
        setIsPlaying(false);
    }, []);

    const handleTogglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleComplete = useCallback(() => {
        const key = `${activeChapter}-${activeLesson}`;
        setCompletedLessons(prev => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: true };
        });
    }, [activeChapter, activeLesson]);

    const handleNext = useCallback(() => {
        if (activeLesson < (currentChapter?.lessons.length || 0) - 1) {
            setActiveLesson(prev => prev + 1);
        } else if (activeChapter < chapters.length - 1) {
            setActiveChapter(prev => prev + 1);
            setActiveLesson(0);
        }
        setIsPlaying(false);
    }, [activeChapter, activeLesson, chapters.length, currentChapter?.lessons.length]);

    // Guard: loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-violet-500 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-base-content/60 font-medium">Đang tải khóa học...</p>
                </div>
            </div>
        );
    }

    // Guard: error or course not found
    if (error || !course) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <p className="text-6xl mb-4">😮</p>
                    <h2 className="text-xl font-black text-base-content mb-2">
                        {error || 'Không tìm thấy khóa học'}
                    </h2>
                    <p className="text-sm text-base-content/50 mb-4">
                        Khóa học này không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                        <ArrowLeft className="w-4 h-4" /> Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    // Guard: no chapters
    if (chapters.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <p className="text-6xl mb-4">📭</p>
                    <h2 className="text-xl font-black text-base-content mb-2">Chưa có nội dung</h2>
                    <p className="text-sm text-base-content/50 mb-4">
                        Khóa học &quot;{course.courseName}&quot; chưa có chương hoặc bài học nào.
                    </p>
                    <Link to="/my-courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                        <ArrowLeft className="w-4 h-4" /> Quay về khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Curriculum Sidebar */}
            <LearnSidebar
                chapters={chapters}
                activeChapter={activeChapter}
                activeLesson={activeLesson}
                completedLessons={completedLessons}
                onLessonSelect={handleLessonSelect}
                courseGradient={courseDisplay.gradient}
                courseIcon={courseDisplay.icon}
                courseTitle={courseDisplay.title}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <LearnHeader
                    course={courseDisplay}
                    lessonTitle={viewMode === 'progress' ? 'Phân tích tiến độ' : (enrichedLesson?.title || '')}
                    progress={overallProgress}
                />

                {/* Scrollable content area */}
                <main className="flex-1 overflow-y-auto">
                    {viewMode === 'progress' ? (
                        <LearnProgressView
                            chapters={chapters}
                            completedLessons={completedLessons}
                            courseGradient={courseDisplay.gradient}
                            courseTitle={courseDisplay.title}
                            courseIcon={courseDisplay.icon}
                            expertName={expert?.name}
                            expertAvatar={expert?.avatar}
                        />
                    ) : (
                        <div className="max-w-5xl mx-auto px-6 py-6">
                            {/* Video Player */}
                            <LearnVideoPlayer
                                lesson={enrichedLesson}
                                gradient={courseDisplay.gradient}
                                isPlaying={isPlaying}
                                onTogglePlay={handleTogglePlay}
                                loadingContent={loadingContent}
                            />

                            {/* Lesson Content */}
                            <LearnLessonContent
                                lesson={enrichedLesson}
                                chapter={currentChapter}
                                nextLesson={nextLesson}
                                expertName={expert?.name}
                                expertAvatar={expert?.avatar}
                                gradient={courseDisplay.gradient}
                                onNext={handleNext}
                                onComplete={handleComplete}
                                isCompleted={!!completedLessons[`${activeChapter}-${activeLesson}`]}
                                loadingContent={loadingContent}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
