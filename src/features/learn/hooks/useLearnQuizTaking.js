import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { courseApi } from '@/shared/api';
import { normalizeQuestions } from '@/features/learn/components/learnQuizUtils';

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

    const handleSubmit = useCallback((nextResult) => {
        setResult(nextResult);
        setPhase('results');
    }, []);

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
