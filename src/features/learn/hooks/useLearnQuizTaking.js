import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { courseApi } from '@/shared/api';
import { readCachedUserProfile } from '@/shared/user';
import { normalizeQuestions } from '@/features/learn/components/learnQuizUtils';

const LEARN_PROGRESS_STORAGE_KEY = 'skr-learn-course-progress-v1';
const QUIZ_PASS_THRESHOLD = 70;

function readStoredProgressMap() {
    try { return JSON.parse(localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY) || '{}'); } catch { return {}; }
}

/** Ghi lesson đã hoàn thành vào localStorage để tab gốc đồng bộ khi reload */
function writeCompletedToStorage(courseId, lessonId, userId) {
    if (!courseId || !lessonId) return;
    const key = `${userId || 'anonymous'}:${courseId}`;
    const store = readStoredProgressMap();
    const entry = store[key] || {};
    const ids = Array.isArray(entry.completedLessonIds) ? entry.completedLessonIds : [];
    const lessonIdStr = String(lessonId);
    if (!ids.includes(lessonIdStr)) {
        store[key] = {
            completedLessonIds: [...ids, lessonIdStr],
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LEARN_PROGRESS_STORAGE_KEY, JSON.stringify(store));
    }
}

export default function useLearnQuizTaking() {
    const { id: courseId, chapterId, lessonId } = useParams();
    const [searchParams] = useSearchParams();
    const gradient = searchParams.get('gradient') || 'from-violet-500 to-purple-500';
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phase, setPhase] = useState('taking');
    const [result, setResult] = useState(null);

    useEffect(() => {
        let ignore = false;

        const fetchContent = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getLessonContent(courseId, chapterId, lessonId);
                if (ignore) return;
                const data = response?.data || response || {};
                setLesson(data);
            } catch (err) {
                if (!ignore) {
                    console.error('Error loading quiz:', err);
                    setError('Không thể tải nội dung bài quiz.');
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        fetchContent();
        return () => {
            ignore = true;
        };
    }, [chapterId, courseId, lessonId]);

    const questions = useMemo(() => normalizeQuestions(lesson), [lesson]);

    useEffect(() => {
        if (phase !== 'taking') return undefined;
        const handler = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [phase]);

    /**
     * Xử lý khi người dùng nộp bài:
     * - Nếu đạt >= 70% → lưu localStorage + gọi API updateProgress
     * - Luôn chuyển sang phase 'results'
     */
    const handleSubmit = useCallback(async (nextResult) => {
        setResult(nextResult);
        setPhase('results');

        const percentage = nextResult?.percentage ?? 0;
        if (percentage < QUIZ_PASS_THRESHOLD) return;

        // Cập nhật localStorage ngay lập tức để tab gốc nhận khi quay lại
        const profile = readCachedUserProfile();
        writeCompletedToStorage(courseId, lessonId, profile?.userId);

        // Lưu lên server
        try {
            await courseApi.updateProgress(courseId, {
                lessonId,
                chapterId,
                completed: true,
            });
        } catch (err) {
            console.error('Error saving quiz progress:', err);
            // localStorage đã ghi — tab gốc sẽ nhận khi reload
        }
    }, [chapterId, courseId, lessonId]);

    const handleRetry = useCallback(() => {
        setResult(null);
        setPhase('taking');
    }, []);

    const showReview = useCallback(() => {
        setPhase('review');
    }, []);

    const backToResults = useCallback(() => {
        setPhase('results');
    }, []);

    return {
        lesson,
        loading,
        error,
        phase,
        result,
        questions,
        gradient,
        handleSubmit,
        handleRetry,
        showReview,
        backToResults,
    };
}
